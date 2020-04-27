import { sleep } from '../utils/event'

const BROADCASTER_NOTIFICATION = 'broadcaster.notification'
const BROACASTER_INDEX_ROUTES = 'broadcaster.indexRoutes'
const PAGE_LIMIT = 20

export async function indexRoutes(ctx: Context) {
  const { clients: { catalog, events }, vtex: { logger }, body } = ctx
  const { 
    indexBucket,
    from,
    processedProducts,
    productsWithoutSKU,
    authToken,
  }: IndexRoutesEvent = body
  const to = from + PAGE_LIMIT - 1
  const { data, range: { total } } = await catalog.getProductsAndSkuIds(from, to, authToken)
  if (processedProducts >= total || from >= total) {
    logger.info({ message: `Indexation complete`, processedProducts, productsWithoutSKU, total, indexBucket })
    return
  }

  const productIds = Object.keys(data)
  const skuIds = productIds.reduce((acc, productId) => {
    const skus = data[productId]
    if (skus.length) {
      const skuId = skus[0]
      acc.push(skuId)
    } 
    return acc
  }, [] as number[])
  for (let idx in skuIds) {
    const skuId = skuIds[idx]
    await sleep(300)
    events.sendEvent('', BROADCASTER_NOTIFICATION, {
      HasStockKeepingUnitModified: true,
      IdSku: skuId,
      indexBucket,
    })
  }
  await sleep(6200)
  const payload: IndexRoutesEvent = {
    indexBucket,
    from: from + PAGE_LIMIT, 
    processedProducts: processedProducts + skuIds.length,
    productsWithoutSKU: productsWithoutSKU + PAGE_LIMIT - skuIds.length,
    authToken,
  } 
  logger.info({ 
    message: 'Processed', 
    processedProducts: payload.processedProducts, 
    productsWithoutSKU: payload.productsWithoutSKU, 
    totalProducts: total, 
    from, 
    indexBucket,
  })
  events.sendEvent('', BROACASTER_INDEX_ROUTES, payload)
}

export function indexAllRoutes(ctx: ServiceContext) {
  const { clients: { events }, vtex: { adminUserAuthToken, logger } } = ctx
  if (!adminUserAuthToken) {
    ctx.status = 401
    logger.error(`Missing adminUserAuth token`)
    return
  }
  // ADD indexBucket and token in VBASE?

  const indexBucket = (Math.random() * 10000).toString()
  const payload: IndexRoutesEvent = {
    indexBucket,
    from: 0,
    processedProducts: 0,
    productsWithoutSKU: 0,
    authToken: adminUserAuthToken, // ISSO é SEGUTRO?
  }
  events.sendEvent('', BROACASTER_INDEX_ROUTES, payload)
  ctx.status = 200
}
