import { RecorderState, IOClients, EventContext } from '@vtex/api'

declare global {
  type Context = EventContext<IOClients, State>

  interface State extends RecorderState, BroadcasterEvent {
    alwaysNotify: boolean
    payload: BroadcasterEvent
  }

  interface BroadcasterEvent {
    HasStockKeepingUnitModified: boolean
    IdSku: string
  }

  type ID = string
  type Float = number
  type Int = number
}
