import { Category } from '@vtex/api/lib/clients/apps/catalogGraphQL/category'
import { RecorderState, EventContext, ServiceContext as ServiceCtx, ParamsContext } from '@vtex/api'
import { Clients } from './clients/index'

declare global {
  type Context = EventContext<Clients, State>
  type ServiceContext = ServiceCtx<Clients, State, ParamsContext>

  interface State extends RecorderState, BroadcasterEvent, IndexRoutesEvent {
    nextPayload: IndexRoutesEvent
  }

  interface BroadcasterEvent {
    HasStockKeepingUnitModified: boolean
    IdSku: string
    indexBucket?: string
  }

  interface IndexRoutesEvent {
    indexBucket?: string
    from: number
    processedProducts: number
    productsWithoutSKU: number
    attempt?: number
  }

  interface IdentifiedCategory extends Category {
    parents: Pick<Category, 'name' | 'id'>[]
  }

  type ID = string
  type Float = number
  type Int = number
}
