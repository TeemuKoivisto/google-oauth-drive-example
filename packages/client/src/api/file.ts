import type { IListFilesQuery, IListFilesResponse, IImportFilesRequest } from '@my-org/types'

import { get, post } from './methods'

export const listFiles = ({ token, expires }: IListFilesQuery) =>
  get<IListFilesResponse>(`files?token=${token}&expires=${expires}`, 'Failed to list files')

export const importFiles = (payload: IImportFilesRequest) =>
  post<IListFilesResponse>('files/download', payload, 'Failed to import files')
