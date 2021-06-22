import { LRUCache, Service, Cached, ParamsContext } from '@vtex/api'

import { locale } from './middlewares/locale'
import { notify } from './middlewares/notify'
import { throttle } from './middlewares/throttle'
import { indexRoutes, indexAllRoutes } from './middlewares/indexRoutes'
import { Clients } from './clients'
import { validation } from './middlewares/validation'
import { nextEvent } from './middlewares/nextEvent'
import { errors } from './middlewares/errors'
import { settings } from './middlewares/settings'
import { filterStockEvents } from './middlewares/filterStock'

const TREE_SECONDS_MS = 3 * 1000
const CONCURRENCY = 10

const tenantCacheStorage = new LRUCache<string, Cached>({
  max: 3000
})

const segmentCacheStorage = new LRUCache<string, Cached>({
  max: 3000
})

metrics.trackCache('tenant', tenantCacheStorage)
metrics.trackCache('segment', segmentCacheStorage)

export default new Service<Clients, State, ParamsContext>({
  clients: {
    implementation: Clients,
    options: {
      default: {
        exponentialTimeoutCoefficient: 2,
        exponentialBackoffCoefficient: 2,
        initialBackoffDelay: 50,
        retries: 1,
        timeout: TREE_SECONDS_MS,
        concurrency: CONCURRENCY,
      },
      tenant: {
        memoryCache: tenantCacheStorage,
        timeout: TREE_SECONDS_MS
      },
      segment: {
        memoryCache: segmentCacheStorage,
        timeout: TREE_SECONDS_MS
      },
      events: {
        timeout: TREE_SECONDS_MS
      },
      vbase: {
        concurrency: 5,
      }
    },
  },
  events: {
    broadcasterNotification: [
      filterStockEvents, settings, errors, throttle, locale, notify,
    ],
    indexRoutes: [settings, errors, indexRoutes, nextEvent],
  },
  routes: {
    indexRoutes: [validation, indexAllRoutes],
  },
})
