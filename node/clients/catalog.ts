import { IOContext, InstanceOptions, ExternalClient } from "@vtex/api";

import {
  Brand,
  BrandApi,
  Category,
  CategoryApi,
  Product,
  ProductApi,
  Sku,
  SkuApi,
  toBrand,
  toCategory,
  toProduct,
  toSku,
} from '../utils/catalogMappers'

interface GetProductsAndSkuIdsReponse {
  data: Record<string, number[]>
  range: {
    total: number
    from: number
    to: number
  }
}

interface SalesChannelApi {
  Id: number
}

interface ProductSalesPolicyApi {
  StoreId: number
}

export class Catalog extends ExternalClient {
  public constructor(context: IOContext, options?: InstanceOptions) {
    super(
      `http://${context.account}.vtexcommercestable.com.br`,
      context,
      {
        ...(options ?? {}),
        headers: {
          ...(options?.headers ?? {}),
          'VtexIdclientAutCookie': context.authToken,
          'Content-Type': 'application/json',
          'X-Vtex-Use-Https': 'true',
        }, 
      }
    )
  }

  public getProductsAndSkuIds (from: number, to: number): Promise<GetProductsAndSkuIdsReponse>{
    return this.http.get('/api/catalog_system/pvt/products/GetProductAndSkuIds', {
      params: {
        _from: from,
        _to: to
      },
      headers: {
      }
    })
  }

  public async getSku(id: string): Promise<Sku | null> {
    const sku = await this.getOrNull<SkuApi>(
      `/api/catalog/pvt/stockkeepingunit/${id}`,
      'catalog-get-sku'
    )
    return sku && toSku(sku)
  }

  public async getProduct(id: string): Promise<Product | null> {
    const product = await this.getOrNull<ProductApi>(
      `/api/catalog/pvt/product/${id}`,
      'catalog-get-product'
    )
    if (!product) {
      return null
    }
    return toProduct(product, await this.getSalesChannels(id))
  }

  public async getBrand(id: string): Promise<Brand | null> {
    const brand = await this.getOrNull<BrandApi>(
      `/api/catalog/pvt/brand/${id}`,
      'catalog-get-brand'
    )
    return brand && toBrand(brand)
  }

  public async getCategory(id: string): Promise<Category | null> {
    const category = await this.getOrNull<CategoryApi>(
      `/api/catalog/pvt/category/${id}`,
      'catalog-get-category'
    )
    return category && toCategory(category)
  }

  /* Products without an explicit sales policy are sold in every channel. */
  private async getSalesChannels(productId: string): Promise<Array<{ id: string }>> {
    const policies = await this.http.get<ProductSalesPolicyApi[]>(
      `/api/catalog/pvt/product/${productId}/salespolicy`,
      { metric: 'catalog-get-product-sales-policy' }
    )
    if (policies.length > 0) {
      return policies.map(({ StoreId }) => ({ id: String(StoreId) }))
    }

    const channels = await this.http.get<SalesChannelApi[]>(
      '/api/catalog_system/pvt/saleschannel/list',
      { metric: 'catalog-get-sales-channels' }
    )
    return channels.map(({ Id }) => ({ id: String(Id) }))
  }

  /* A missing entity is not an error: notify skips it, as it did before. */
  private async getOrNull<T>(path: string, metric: string): Promise<T | null> {
    try {
      return await this.http.get<T>(path, { metric })
    } catch (err) {
      if (err.response?.status === 404) {
        return null
      }
      throw err
    }
  }
}
