import { GaxiosError, GaxiosPromise } from 'gaxios'

import { Result } from './types'

function sleep(ms: number): Promise<boolean> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(true)
    }, ms)
  })
}

/**
 * Wrap Gaxios promises in order to not to throw errors and instead return handled Result types
 * @param promise
 * @returns
 */
export async function wrapGaxios<T>(
  promise: GaxiosPromise<T>,
  timeout = 10000
): Promise<Result<T>> {
  try {
    const res = await Promise.race([promise, sleep(timeout)])
    if (typeof res === 'boolean') {
      return { err: 'Gaxios request timeout', code: 400 }
    } else if (res.status >= 400) {
      return {
        err: ((res.data as any) || '').toString(),
        code: res.status
      }
    }
    return { data: res.data }
  } catch (err: any) {
    if (err instanceof GaxiosError) {
      const code = parseInt(err.code || '500')
      return { err: err.message, code }
    }
    return { err: err, code: err?.status || 500 }
  }
}
