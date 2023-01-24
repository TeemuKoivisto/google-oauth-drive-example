import type { ILoginParams, User } from '@my-org/types'

import * as authApi from '$api/auth'

import { user, jwt } from './auth'

export const authActions = {
  updateUser(updated: User) {
    user.set(updated)
  },
  async login(params: ILoginParams) {
    const result = await authApi.login(params)
    if ('data' in result) {
      user.set(result.data.user)
      jwt.set(result.data.jwt)
    }
    return result
  },
  logout() {
    user.set(null)
    jwt.set(null)
  }
}
