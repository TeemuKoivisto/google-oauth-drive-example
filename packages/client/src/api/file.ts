import type { IListFilesResponse } from '@my-org/types'

import { get, post } from './methods'

export const listFiles = () => get<IListFilesResponse>('files', 'Failed to list files')
