export async function stockFilterEvents(ctx: Context, next: () => Promise<void>) {
  // Temporary if, in the near future broadcaster will only notify us modifications in SKUs or product.
  if (!ctx.body.HasStockKeepingUnitModified) {
    return
  }
  
  await next()
}
