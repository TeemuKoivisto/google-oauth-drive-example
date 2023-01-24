import type { ILoginParams, ILoginResponse } from '@my-org/types'

import { DEFAULT_HEADERS, post } from './methods'

export const login = (payload: ILoginParams) =>
  post<ILoginResponse>('login', payload, 'Failed to login', DEFAULT_HEADERS)
