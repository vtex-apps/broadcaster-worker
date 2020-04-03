const VALIDATION_BUCKET = 'validation'

const oneHourFromNowMS = () => `${new Date(Date.now() + 1 * 60 * 60 * 1000)}`

export const valid = (nextIndexation?: string) => {
  const date = nextIndexation && new Date(nextIndexation)
  if (date && date.toString() !== 'Invalid Date' && date > new Date()) {
    return false 
  }
  return true 
}

export async function validation(ctx: ServiceContext, next: () => Promise<void>) {
  const caller = ctx.headers['x-vtex-caller']
  if (caller.includes('@vtex.com.br')) {
    return next()
  }
  const {
    vtex: { account, workspace },
    clients: { vbase } 
  } = ctx


  const fileName = `${account}-${workspace}`
  const nextIndexation = await vbase.getJSON<string>(VALIDATION_BUCKET, fileName, true)
  if (valid(nextIndexation)) {
    await next()
    await vbase.saveJSON<string>(VALIDATION_BUCKET, fileName, oneHourFromNowMS())
    ctx.status = 200
    return 
  }

  ctx.status = 429
  ctx.body = `A Indexation has already been done in the last hour. Next indexation available after ${nextIndexation}.`
}
