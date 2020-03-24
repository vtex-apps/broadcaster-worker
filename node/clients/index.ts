import { IOClients } from '@vtex/api'
import { Catalog } from './catalog'

export class Clients extends IOClients {
  get catalog() {
    return this.getOrSet('catalog', Catalog)
  }
}
