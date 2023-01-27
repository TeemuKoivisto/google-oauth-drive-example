import { drive_v3 } from 'googleapis'

export type DriveFile = {
  id: string
  name: string
  kind: string
  mimeType: string
}
export interface IListFilesQuery {
  token?: string
  expires?: number
}
export interface IListFilesResponse {
  files: DriveFile[]
}
export interface IImportFilesRequest {
  token: string
  expires: number
  files: DriveFile[]
}
export interface IImportFilesResponse {
  result: Maybe<boolean>[]
}
