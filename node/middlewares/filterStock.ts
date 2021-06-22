export async function filterStockEvents(ctx: Context, next: () => Promise<void>) {
  if (!ctx.body.HasStockKeepingUnitModified) {
    return
  }
  
  await next()
}
