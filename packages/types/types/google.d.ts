import { drive_v3 } from 'googleapis'

export type DriveFile = drive_v3.Schema$File
export interface IListFilesResponse {
  files: drive_v3.Schema$File[]
}
