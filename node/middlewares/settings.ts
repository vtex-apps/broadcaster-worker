import { VTEX_APP_AT_MAJOR } from "../constants"


export interface Settings {
  disableIndexation: boolean 
}

export const DEFAULT_SETTINGS = {
  disableIndexation: false,
}

export async function settings(ctx: Context, next: () => Promise<void>) {
  const {
    clients: { apps },
    vtex: { logger },
  } = ctx

  const { disableIndexation } = {
    ...DEFAULT_SETTINGS,
    ...(await apps.getAppSettings(VTEX_APP_AT_MAJOR) as Settings),
  }
  if (disableIndexation) {
    logger.debug({
      message: 'Indexing disabled',
      ...ctx.body,
    })
    return
  }

  await next()
}
