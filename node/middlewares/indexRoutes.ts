const BROADCASTER_NOTIFICATION = 'broadcaster.notification'
const PAGE_LIMIT = 50
const index = async (ctx: ServiceContext) => {
  const { clients: { catalog, events} } = ctx
  let skuIds: number[] = []
  let from = 0
  let to = PAGE_LIMIT - 1
  do {
    debugger
    const { data } = await catalog.getProductsAndSkuIds(from, to)
    const productIds = Object.keys(data)
    skuIds = productIds.reduce((acc, productId) => {
      const skus = data[productId]
      if (skus.length) {
        const skuId = skus[0]
        // events.sendEvent('', BROADCASTER_NOTIFICATION, {
        //   HasStockKeepingUnitModified: true,
        //   IdSku: skuId,
        // })
        acc.push(skuId)
      }
      return acc
    }, [] as number[])
    debugger
  } while(skuIds.length)
}

export function indexRoutes(ctx: ServiceContext) {
  index(ctx)
  ctx.status = 200
}
