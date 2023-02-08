import type {
  IListDrivesResponse,
  IListFilesQuery,
  IListFilesResponse,
  IImportFilesRequest
} from '@my-org/types'

import { get, post } from './methods'

export const listDrives = (token: string) =>
  get<IListDrivesResponse>(`drives?token=${token}`, 'Failed to list drives')

export const listFiles = ({ token, drive_id }: IListFilesQuery) =>
  get<IListFilesResponse>(
    `files?token=${token}${drive_id ? '&drive_id=' + drive_id : ''}`,
    'Failed to list files'
  )

export const importFiles = (payload: IImportFilesRequest) =>
  post<IListFilesResponse>('files/download', payload, 'Failed to import files')
