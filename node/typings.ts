import { RecorderState, EventContext, ServiceContext as ServiceCtx, ParamsContext } from '@vtex/api'
import { Clients } from './clients/index'

declare global {
  type Context = EventContext<Clients, State>
  type ServiceContext = ServiceCtx<Clients, State, ParamsContext>

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
