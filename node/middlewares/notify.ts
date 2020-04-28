import { IOClients, LINKED} from '@vtex/api'
import { isEmpty, isNil } from 'ramda'

import { USER_BUCKET } from '../constants'
import {
  objToHash,
  providerToVbaseFilename,
  Storage,
  toBrandProvider,
  toCategoryProvider,
  toProductProvider,
  toSkuProvider,
} from '../utils/catalog'
import {
  brandChanged,
  categoryChanged,
  productChanged,
  skuChanged,
} from './../utils/event'

const isStorage = (maybeStorage: {} | Storage | null): maybeStorage is Storage => {
  if (isNil(maybeStorage) || isEmpty(maybeStorage)) {
    return false
  }
  return true
}

const replaceIfChanged = async <T>(
  data: T,
  fileName: string,
  bucket: string,
  { vbase }: IOClients
) => {
  const hash = objToHash(data)

  const oldHash = await vbase
    .getJSON<Storage | null>(bucket, fileName, true)
    .then(maybeHash => isStorage(maybeHash) ? maybeHash.hash : null)
    
  if (oldHash !== hash) {
    await vbase.saveJSON<Storage>(bucket, fileName, { hash })
    return true
  }

  return false
}

const getAllCategories = async (categoryId: string | undefined, ctx: Context): Promise<IdentifiedCategory[]> => {
  const { clients: { catalogGraphQL } } = ctx
  if (!categoryId) {
    return []
  }
  const categoryResponse = await catalogGraphQL.category(categoryId)
  if (!categoryResponse || !categoryResponse.category) {
    return []
  }
  const { category } = categoryResponse
  const categories = await getAllCategories(category.parentCategoryId, ctx)
  const identifiedCategory = {
    ...category,
    parents: categories.map(c => ({id: c.id, name: c.name}))
  }
  return [...categories, identifiedCategory]
}

export async function notify(ctx: Context, next: () => Promise<any>) {
  const {
    clients: { catalogGraphQL, events },
    clients,
    body: { IdSku, indexBucket },
    vtex: { logger },
  } = ctx
  const bucket = indexBucket || USER_BUCKET
  const eventPromises = []
  const changedEntities: Record<string, number> = {}
  const logWholeProductAndSku = {sku: {}, product: {}}

  // Modification in SKU
  const skuResponse = await catalogGraphQL.sku(IdSku)
  if (!skuResponse || !skuResponse.sku) {
    return
  }
  const { sku } = skuResponse
  const filenameSku = providerToVbaseFilename(toSkuProvider(sku.id))
  let changed = await replaceIfChanged(sku, filenameSku, bucket, clients)
  if (changed) {
    logWholeProductAndSku.sku = sku
    eventPromises.push(events.sendEvent('', skuChanged, sku))
    changedEntities.sku = 1
  }

  // Modification in Product
  const productResponse = await catalogGraphQL.product(sku.productId)
  if (!productResponse || !productResponse.product) {
    return
  }
  const { product } = productResponse
  const filenameProduct = providerToVbaseFilename(
    toProductProvider(sku.productId)
  )
  changed = await replaceIfChanged(product, filenameProduct, bucket, clients)
  if (changed) {
    logWholeProductAndSku.product = product
    eventPromises.push(events.sendEvent('', productChanged, product))
    changedEntities.product = 1
  }

  // Modification in Brand
  const brandResponse = await catalogGraphQL.brand(product.brandId)
  if (!brandResponse || !brandResponse.brand) {
    return
  }
  const { brand } = brandResponse
  const filenameBrand = providerToVbaseFilename(
    toBrandProvider(product.brandId)
  )
  changed = await replaceIfChanged(brand, filenameBrand, bucket, clients)
  if (changed) {
    eventPromises.push(events.sendEvent('', brandChanged, brand))
    changedEntities.brand = 1
  } 

  // Modification in Categories
  const categories = await getAllCategories(product.categoryId, ctx)
  const changedCategoriesIds: string[] = []
  for (const category of categories) {
    const filenameCategory = providerToVbaseFilename(
      toCategoryProvider(category.id)
    )
    changed = await replaceIfChanged(category, filenameCategory, bucket, clients)
    if (changed) {
      changedCategoriesIds.push(category.id)
      eventPromises.push(events.sendEvent('', categoryChanged, category))
    }
  }
  changedEntities.categories = changedCategoriesIds.length

  // Wait for all events to be sent
  await Promise.all(eventPromises)

  metrics.batch('changed-entities', undefined, changedEntities)

  if (!isEmpty(logWholeProductAndSku.sku) && !isEmpty(logWholeProductAndSku.product)) {
    logger.debug({
      'sku': logWholeProductAndSku.sku,
      'product': logWholeProductAndSku.product
    })
  }

  if (LINKED) {
    console.log('changedEntities', changedEntities, { sku: sku.id, brand: brand.id, product: product.id, categories: changedCategoriesIds})
  }

  await next()
}
