import { sleep } from '../utils/event'

export const BROACASTER_INDEX_ROUTES = 'broadcaster.indexRoutes'
const BROADCASTER_NOTIFICATION = 'broadcaster.notification'
const PAGE_LIMIT = 10
const BUCKET = 'indexRoutes'
const FILE = 'data.json'

const index = async (ctx: Context, next: () => Promise<void>) => {
  const { clients: { catalog, events, noCacheVBase }, vtex: { logger }, body } = ctx
  logger.info({ message: 'Event received', payload: ctx.body})
  const {
    indexBucket,
    from,
    processedProducts,
    productsWithoutSKU,
  }: IndexRoutesEvent = body

  const { data: dataFile, headers: {etag} } = await noCacheVBase.getRawJSON<IndexRoutesEvent>(BUCKET, FILE, true)
  if (dataFile?.indexBucket != indexBucket) {
    logger.debug({ 
      message: 'Invalid Indexation', 
      currentIndexBucket: dataFile?.indexBucket, 
      from,
      receivedIndexBucket: indexBucket
    })
    return
  }

  if (from < (dataFile?.from ?? 0)) {
    logger.debug({
      message: 'Duplicated event',
      currentIndexBucket: dataFile?.indexBucket,
      from,
      receivedIndexBucket: indexBucket
    })
    return
  }

  const to = from + PAGE_LIMIT - 1
  const { data, range: { total } } = await catalog.getProductsAndSkuIds(from, to)
  let countProductsWithoutSKU = 0

  const productIds = Object.keys(data)
  const skuIds = productIds.reduce((acc, productId) => {
    const skus = data[productId]
    if (skus.length) {
      const skuId = skus[0]
      acc.push(skuId)
    } else {
      countProductsWithoutSKU++
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
    productsWithoutSKU: productsWithoutSKU + countProductsWithoutSKU,
  }
  ctx.state.nextPayload = payload
  if (payload.processedProducts >= total || payload.from >= total) {
    logger.info({ 
      message: `Indexation complete`, 
      processedProducts: payload.processedProducts, 
      productsWithoutSKU: payload.productsWithoutSKU, 
      total, 
      indexBucket 
    })
    await noCacheVBase.deleteFile(BUCKET, FILE)
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

    const shouldTriggerNext : boolean = await noCacheVBase.saveJSON(BUCKET, FILE, payload, undefined, etag)
      .then(_ => true)
      .catch(e => e?.response?.status != 412)

    if (shouldTriggerNext) await next()
  }
}

export async function indexRoutes(ctx: Context, next: () => Promise<void>) {
  const { vtex: { logger } } = ctx
  try {
    await index(ctx, next)
  } catch (error) {
    logger.error({ message: 'Indexation error', error, payload: ctx.body})
    throw error
  }
}

export async function indexAllRoutes(ctx: ServiceContext) {
  const { clients: { events, noCacheVBase } } = ctx
  const indexBucket = (Math.random() * 10000).toString()
  const data = { indexBucket, from: 0 }
  await noCacheVBase.saveJSON(BUCKET, FILE, data)

  const payload: IndexRoutesEvent = {
    indexBucket,
    from: 0,
    processedProducts: 0,
    productsWithoutSKU: 0,
  }
  events.sendEvent('', BROACASTER_INDEX_ROUTES, payload)
  ctx.status = 200
}
