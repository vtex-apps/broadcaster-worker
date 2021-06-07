import { IOClients } from '@vtex/api'
import { Catalog } from './catalog'
import { NoCacheVBase } from './noCacheVBase'

export class Clients extends IOClients {
  public get catalog() {
    return this.getOrSet('catalog', Catalog)
  }

  public get noCacheVBase() {
    return this.getOrSet('noCacheVBase', NoCacheVBase)
  }
}
