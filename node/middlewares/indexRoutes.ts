import { sleep } from '../utils/event'

const BROADCASTER_NOTIFICATION = 'broadcaster.notification'
const BROACASTER_INDEX_ROUTES = 'broadcaster.indexRoutes'
const PAGE_LIMIT = 20
// const MAX_ATTEMPTS = 3
const BUCKET = 'indexRoutes'
const FILE = 'data.json'

const index = async (ctx: Context) => {
  const { clients: { catalog, events, vbase }, vtex: { logger }, body } = ctx
  const {
    indexBucket,
    from,
    processedProducts,
    productsWithoutSKU,
  }: IndexRoutesEvent = body

  const dataFile = await vbase.getJSON<{ indexBucket: string, authToken: string }>(BUCKET, FILE, true)
  if (dataFile?.indexBucket != indexBucket) {
    logger.debug({ 
      message: 'Invalid Indexation', 
      currentIndexBucket: dataFile?.indexBucket, 
      receivedIndexBucket: indexBucket
    })
    return
  }

  const { authToken } = dataFile
  const to = from + PAGE_LIMIT - 1
  const { data, range: { total } } = await catalog.getProductsAndSkuIds(from, to, authToken)

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
    await sleep(50)
    events.sendEvent('', BROADCASTER_NOTIFICATION, {
      HasStockKeepingUnitModified: true,
      IdSku: skuId,
      indexBucket,
    })
  }
  const payload: IndexRoutesEvent = {
    indexBucket,
    from: from + PAGE_LIMIT,
    processedProducts: processedProducts + skuIds.length,
    productsWithoutSKU: productsWithoutSKU + PAGE_LIMIT - skuIds.length,
  }
  if (payload.processedProducts >= total || payload.from >= total) {
    logger.info({ 
      message: `Indexation complete`, 
      processedProducts: payload.processedProducts, 
      productsWithoutSKU: payload.productsWithoutSKU, 
      total, 
      indexBucket 
    })
    await vbase.deleteFile(BUCKET, FILE)
    return
  } else {
    logger.info({
      message: 'Processed',
      processedProducts: payload.processedProducts,
      productsWithoutSKU: payload.productsWithoutSKU,
      totalProducts: total,
      from,
      indexBucket,
    })
    events.sendEvent('', BROACASTER_INDEX_ROUTES, payload)
    logger.info({ message: 'Event sent', payload })
  }
}

export async function indexRoutes(ctx: Context) {
  const { vtex: { logger } } = ctx
  logger.info({ message: 'Event received', payload: ctx.body})
  try {
    await index(ctx)
  } catch (error) {
    logger.error({ message: 'Indexation error', error, payload: ctx.body})
    throw error
  }
}

export async function indexAllRoutes(ctx: ServiceContext) {
  const { clients: { events, vbase }, vtex: { adminUserAuthToken, logger } } = ctx
  if (!adminUserAuthToken) {
    ctx.status = 401
    logger.error(`Missing adminUserAuth token`)
    return
  }
  const indexBucket = (Math.random() * 10000).toString()
  await vbase.saveJSON(BUCKET, FILE, {
    indexBucket,
    authToken: adminUserAuthToken,
  })

  const payload: IndexRoutesEvent = {
    indexBucket,
    from: 0,
    processedProducts: 0,
    productsWithoutSKU: 0,
  }
  events.sendEvent('', BROACASTER_INDEX_ROUTES, payload)
  ctx.status = 200
}
