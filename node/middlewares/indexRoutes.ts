const BROADCASTER_NOTIFICATION = 'broadcaster.notification'
const PAGE_LIMIT = 20

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const index = async (ctx: ServiceContext) => {
  const { clients: { catalog, events}, vtex: { logger } } = ctx
  let skuIds: number[] = []
  let from = 0
  let to = PAGE_LIMIT - 1
  let totalProcessedProducts = 0
  do {
    const { data } = await catalog.getProductsAndSkuIds(from, to)
    const productIds = Object.keys(data)
    skuIds = productIds.reduce((acc, productId) => {
      const skus = data[productId]
      if (skus.length) {
        const skuId = skus[0]
        events.sendEvent('', BROADCASTER_NOTIFICATION, {
          HasStockKeepingUnitModified: true,
          IdSku: skuId,
          alwaysNotify: true,
        })
        acc.push(skuId)
        totalProcessedProducts += 1
      }
      return acc
    }, [] as number[])
    from += PAGE_LIMIT
    to += PAGE_LIMIT
    await sleep(500)
  } while(skuIds.length)
  logger.info(`Indexation of ${totalProcessedProducts} complete`)
}

export function indexRoutes(ctx: ServiceContext) {
  if (!ctx.vtex.adminUserAuthToken) {
    ctx.status = 401
    return
  }
  index(ctx)
  ctx.status = 200
}
