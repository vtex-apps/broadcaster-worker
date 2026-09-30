/**
 * Maps Catalog REST responses to the exact shape (field names, string ids,
 * nulls and key order) the worker used to get from catalog-graphql. The order
 * matters: notify.ts hashes JSON.stringify(entity) to detect changes.
 */

export interface SkuApi {
  Id: number
  ProductId: number
  IsActive: boolean
  Name?: string | null
  Height?: number | null
  Length?: number | null
  Width?: number | null
  WeightKg?: number | null
  PackagedHeight?: number | null
  PackagedWidth?: number | null
  PackagedLength?: number | null
  PackagedWeightKg?: number | null
  CubicWeight?: number | null
  IsKit: boolean
  CreationDate?: string | null
  RewardValue?: number | null
  ManufacturerCode?: string | null
  CommercialConditionId?: number | null
  MeasurementUnit?: string | null
  UnitMultiplier?: number | null
  ModalType?: string | null
  KitItensSellApart?: boolean | null
}

export interface ProductApi {
  Id: number
  Name?: string | null
  DepartmentId: number
  CategoryId: number
  BrandId: number
  LinkId?: string | null
  RefId?: string | null
  IsVisible: boolean
  Description?: string | null
  DescriptionShort?: string | null
  ReleaseDate?: string | null
  KeyWords?: string | null
  Title?: string | null
  IsActive: boolean
  TaxCode?: string | null
  MetaTagDescription?: string | null
  SupplierId?: number | null
  ShowWithoutStock: boolean
  Score?: number | null
}

export interface BrandApi {
  Id: number
  Name?: string | null
  Text?: string | null
  Keywords?: string | null
  SiteTitle?: string | null
  Active: boolean
  MenuHome?: boolean | null
  AdWordsRemarketingCode?: string | null
  LomadeeCampaignCode?: string | null
  Score?: number | null
}

export interface CategoryApi {
  Id: number
  Name?: string | null
  Title?: string | null
  FatherCategoryId?: number | null
  Description?: string | null
  IsActive: boolean
  GlobalCategoryId?: number | string | null
  Score?: number | null
}

export interface Sku {
  id: string
  productId: string
  isActive: boolean
  name: string | null
  height: number | null
  length: number | null
  width: number | null
  weightKg: number | null
  packagedHeight: number | null
  packagedWidth: number | null
  packagedLength: number | null
  packagedWeightKg: number | null
  cubicWeight: number | null
  isKit: boolean
  creationDate: string | null
  rewardValue: number | null
  manufacturerCode: string | null
  commercialConditionId: string | null
  measurementUnit: string | null
  unitMultiplier: number | null
  modalType: string | null
  kitItensSellApart: boolean
}

export interface Product {
  id: string
  brandId: string
  categoryId: string
  departmentId: string
  name: string | null
  linkId: string | null
  refId: string | null
  isVisible: boolean
  description: string | null
  shortDescription: string | null
  releaseDate: string | null
  keywords: string[]
  title: string | null
  isActive: boolean
  taxCode: string | null
  metaTagDescription: string | null
  supplierId: string | null
  showWithoutStock: boolean
  score: number | null
  salesChannel: Array<{ id: string }>
}

export interface Brand {
  id: string
  name: string | null
  text: string | null
  keywords: string[]
  siteTitle: string | null
  active: boolean
  menuHome: boolean
  adWordsRemarketingCode: string | null
  lomadeeCampaignCode: string | null
  score: number | null
}

export interface Category {
  id: string
  name: string | null
  title: string | null
  parentCategoryId: string | null
  description: string | null
  isActive: boolean
  globalCategoryId: string | null
  score: number | null
}

/* GraphQL returned null for missing values, never undefined. */
const orNull = <T>(value: T | null | undefined): T | null =>
  value === undefined ? null : value

const toId = (value: number | string | null | undefined): string | null =>
  value === undefined || value === null ? null : String(value)

/* Only truthy ids are mapped, so 0 and null both become null like before. */
const toOptionalId = (value: number | null | undefined): string | null =>
  value ? String(value) : null

const toKeywords = (keywords: string | null | undefined): string[] =>
  keywords ? keywords.split(',').map(keyword => keyword.trim()) : []

export const toSku = (api: SkuApi): Sku => ({
  id: String(api.Id),
  productId: String(api.ProductId),
  isActive: api.IsActive,
  name: orNull(api.Name),
  height: orNull(api.Height),
  length: orNull(api.Length),
  width: orNull(api.Width),
  weightKg: orNull(api.WeightKg),
  packagedHeight: orNull(api.PackagedHeight),
  packagedWidth: orNull(api.PackagedWidth),
  packagedLength: orNull(api.PackagedLength),
  packagedWeightKg: orNull(api.PackagedWeightKg),
  cubicWeight: orNull(api.CubicWeight),
  isKit: api.IsKit,
  creationDate: orNull(api.CreationDate),
  rewardValue: orNull(api.RewardValue),
  manufacturerCode: orNull(api.ManufacturerCode),
  commercialConditionId: toId(api.CommercialConditionId),
  measurementUnit: orNull(api.MeasurementUnit),
  unitMultiplier: orNull(api.UnitMultiplier),
  modalType: orNull(api.ModalType),
  kitItensSellApart: api.KitItensSellApart ?? false,
})

export const toProduct = (
  api: ProductApi,
  salesChannel: Array<{ id: string }>
): Product => ({
  id: String(api.Id),
  brandId: String(api.BrandId),
  categoryId: String(api.CategoryId),
  departmentId: String(api.DepartmentId),
  name: orNull(api.Name),
  linkId: orNull(api.LinkId),
  refId: orNull(api.RefId),
  isVisible: api.IsVisible,
  description: orNull(api.Description),
  shortDescription: orNull(api.DescriptionShort),
  releaseDate: orNull(api.ReleaseDate),
  keywords: toKeywords(api.KeyWords),
  title: orNull(api.Title),
  isActive: api.IsActive,
  taxCode: orNull(api.TaxCode),
  metaTagDescription: orNull(api.MetaTagDescription),
  supplierId: toOptionalId(api.SupplierId),
  showWithoutStock: api.ShowWithoutStock,
  score: orNull(api.Score),
  salesChannel,
})

export const toBrand = (api: BrandApi): Brand => ({
  id: String(api.Id),
  name: orNull(api.Name),
  text: orNull(api.Text),
  keywords: toKeywords(api.Keywords),
  siteTitle: orNull(api.SiteTitle),
  active: api.Active,
  menuHome: api.MenuHome || false,
  adWordsRemarketingCode: orNull(api.AdWordsRemarketingCode),
  lomadeeCampaignCode: orNull(api.LomadeeCampaignCode),
  score: orNull(api.Score),
})

export const toCategory = (api: CategoryApi): Category => ({
  id: String(api.Id),
  name: orNull(api.Name),
  title: orNull(api.Title),
  parentCategoryId: toOptionalId(api.FatherCategoryId),
  description: orNull(api.Description),
  isActive: api.IsActive,
  globalCategoryId: toId(api.GlobalCategoryId),
  score: orNull(api.Score),
})
