import { BROACASTER_INDEX_ROUTES } from "./indexRoutes"

export async function nextEvent(ctx: Context) {
  const { vtex: { logger }, clients: { events }, state: { nextPayload } } = ctx
  events.sendEvent('', BROACASTER_INDEX_ROUTES, nextPayload)
  logger.info({ message: 'Event sent', nextPayload })
}