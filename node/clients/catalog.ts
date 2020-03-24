import { IOContext, InstanceOptions, ExternalClient } from "@vtex/api";

interface GetProductsAndSkuIdsReponse {
  data: Record<string, number[]>
  range: {
    total: number
    from: number
    to: number
  }
}

export class Catalog extends ExternalClient {
  constructor(protected context: IOContext, options?: InstanceOptions) {
    super(
      `http://${context.account}.vtexcommercestable.com.br`,
      context,
      {
        ...(options ?? {}),
        headers: {
          ...(options?.headers ?? {}),
          'Content-Type': 'application/json',
          'X-Vtex-Use-Https': 'true',
          ...(context.adminUserAuthToken? { VtexIdclientAutCookie: context.adminUserAuthToken }: null),
        },
      }
    )
  }

  public getProductsAndSkuIds (from: number, to: number): Promise<GetProductsAndSkuIdsReponse>{
    return this.http.get('/api/catalog_system/pvt/products/GetProductAndSkuIds', {
      params: {
        _from: from,
        _to: to
      }
    })
  }
}