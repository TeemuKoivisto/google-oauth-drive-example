import type { IListFilesQuery, IListFilesResponse } from '@my-org/types'

import { get, post } from './methods'

export const listFiles = (token: string, expires: number) =>
  get<IListFilesResponse>(`files?token=${token}&expires=${expires}`, 'Failed to list files')
