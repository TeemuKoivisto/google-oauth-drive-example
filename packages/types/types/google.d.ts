import { drive_v3 } from 'googleapis'

export type DriveFile = {
  id: string
  name: string
}
export interface IListFilesQuery {
  token?: string
  expires?: number
}
export interface IListFilesResponse {
  files: DriveFile[]
}
