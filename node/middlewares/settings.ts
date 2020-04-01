import { VTEX_APP_AT_MAJOR } from '../constants'

export interface Settings {
  alwaysNotify: boolean
}

const DEFAULT_SETTINGS: Settings = {
  alwaysNotify: false,
}

const parseSettings = (appSettings: any): Settings => ({
  ...DEFAULT_SETTINGS,
  ...appSettings,
})

export async function settings(ctx: Context, next: () => Promise<any>) {
  const {
    clients: { apps },
  } = ctx

  const { alwaysNotify } = await apps.getAppSettings(VTEX_APP_AT_MAJOR).then(parseSettings)

  ctx.state.alwaysNotify = alwaysNotify
  
  await next()
}
