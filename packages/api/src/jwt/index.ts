import pkg from 'jsonwebtoken'
const { sign, verify } = pkg

import { config } from '$common'

import { Maybe, User } from '@my-org/types'
import { ILoginJwt } from '$typings/auth'

export function generateLoginPayload(user: User) {
  const expires = Date.now() + 86400000 * 14 // 2 weeks
  const payload: ILoginJwt = { expires, user }
  return {
    expires,
    token: sign(payload, config.JWT.SECRET, { algorithm: 'HS512', expiresIn: '2w' })
  }
}

function decryptToken<T>(token: string): Maybe<T> {
  try {
    return { data: verify(token, config.JWT.SECRET) as T }
  } catch (err: any) {
    return { err, code: 403 }
  }
}

export const decryptLoginToken = (token: string) => decryptToken<ILoginJwt>(token)
