import { sleep } from '../utils/event'

const BROADCASTER_NOTIFICATION = 'broadcaster.notification'
const PAGE_LIMIT = 20

const index = async (ctx: ServiceContext) => {
  const { clients: { catalog, events }, vtex: { logger } } = ctx
  let skuIds: number[] = []
  let from = 0
  let to = PAGE_LIMIT - 1
  let processedProducts = 0
  let productsWithoutSKU = 0
  let totalProducts

  const indexBucket = (Math.random() * 10000).toString()
  do {
    const { data, range: { total } } = await catalog.getProductsAndSkuIds(from, to)
    if (!totalProducts) {
      totalProducts = total
    }
    const productIds = Object.keys(data)
    skuIds = productIds.reduce((acc, productId) => {
      const skus = data[productId]
      if (skus.length) {
        const skuId = skus[0]
        acc.push(skuId)
        processedProducts += 1
      } else {
        productsWithoutSKU += 1
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
      }).catch(logger.error)
    }
    from += PAGE_LIMIT
    to += PAGE_LIMIT
    await sleep(6050)
  } while(processedProducts < totalProducts && from < totalProducts)
  logger.info({ message: `Indexation complete`, processedProducts, productsWithoutSKU })
}

export function indexRoutes(ctx: ServiceContext) {
  const { adminUserAuthToken, logger } = ctx.vtex
  if (!adminUserAuthToken) {
    ctx.status = 401
    logger.error(`Missing adminUserAuth token`)
    return
  }
  index(ctx)
  ctx.status = 200
}
