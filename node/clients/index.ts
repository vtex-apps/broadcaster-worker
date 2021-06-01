import { IOClients } from '@vtex/api'
import { Catalog } from './catalog'

export class Clients extends IOClients {
  public get catalog() {
    return this.getOrSet('catalog', Catalog)
  }
}
