import { LRUCache, Service, Cached, ParamsContext } from '@vtex/api'

import { locale } from './middlewares/locale'
import { notify } from './middlewares/notify'
import { settings } from './middlewares/settings'
import { throttle } from './middlewares/throttle'
import { indexRoutes } from './middlewares/indexRoutes'
import { Clients } from './clients'

const ONE_SECOND_MS = 1000
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
    options: {
      default: {
        exponentialTimeoutCoefficient: 2,
        exponentialBackoffCoefficient: 2,
        initialBackoffDelay: 50,
        retries: 1,
        timeout: ONE_SECOND_MS,
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
      }
    },
  },
  events: {
    broadcasterNotification: [
      throttle, settings, locale, notify,
    ],
  },
  routes: {
    indexRoutes,
  },
})
