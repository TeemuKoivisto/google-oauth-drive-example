import type { ILoginParams, User } from '@my-org/types'

import * as authApi from '$api/auth'

import { user, jwt } from './auth'
import { googleCredentials, files, selectedFiles, fileTreeRoot, fileTree } from './gapi'

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
    googleCredentials.set(null)
    files.set([])
    fileTree.set(new Map())
    fileTreeRoot.set({
      isRoot: true,
      my_drive: null,
      drives: [],
      shared_with_me: null
    })
    selectedFiles.set(new Map())
  }
}
