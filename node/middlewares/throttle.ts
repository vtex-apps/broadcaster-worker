import { sleep } from './../utils/event';
import { TooManyRequestsError } from '@vtex/api'

const MAX_REQUEST = 5
let COUNTER = 0

export async function throttle(
  _: Context,
  next: () => Promise<void>
) {
  if (COUNTER > MAX_REQUEST) {
    const timeToSleep = Math.ceil(Math.random() * 100)
    await sleep(timeToSleep)
    throw new TooManyRequestsError()
  }

  try {
    COUNTER++
    await next()
  } finally {
    COUNTER--
  }
}