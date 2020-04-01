import { sleep } from '../utils/event'

const BROADCASTER_NOTIFICATION = 'broadcaster.notification'
const PAGE_LIMIT = 20

const index = async (ctx: ServiceContext) => {
  const { clients: { catalog, events }, vtex: { logger } } = ctx
  let skuIds: number[] = []
  let from = 0
  let to = PAGE_LIMIT - 1
  let totalProcessedProducts = 0
  const indexBucket = (Math.random() * 10000).toString()
  do {
    const { data } = await catalog.getProductsAndSkuIds(from, to)
      .catch(err => {
        logger.error(err) 
        return { data: {} as Record<string, number[]> }
      })
    const productIds = Object.keys(data)
    skuIds = productIds.reduce((acc, productId) => {
      const skus = data[productId]
      if (skus.length) {
        const skuId = skus[0]
        acc.push(skuId)
        totalProcessedProducts += 1
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
    await sleep(1000)
  } while(skuIds.length)
  logger.info(`Indexation of ${totalProcessedProducts} products complete`)
}

export function indexRoutes(ctx: ServiceContext) {
  const { adminUserAuthToken, logger } = ctx.vtex
  if (!adminUserAuthToken) {
    ctx.status = 401
    logger.error(`Missiing adminUserAuth token`)
    return
  }
  index(ctx)
  ctx.status = 200
}
