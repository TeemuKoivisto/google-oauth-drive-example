import { Maybe } from './utils'

export interface FileRoot {
  isRoot: true
  my_drive: MyDrive | null
  drives: SharedDrive[]
  shared_with_me: SharedWithMe | null
}
export interface MyDrive {
  id: string
  name: string
  kind: '__my-drive__'
  mimeType?: string
  size?: number
  fileExtension?: string
  thumbnailLink?: string
}
export interface SharedDrive {
  id: string
  name: string
  backgroundImage?: string
  color?: string
}
export interface SharedWithMe {
  id: 'shared-with-me'
  name: string
  kind: '__shared__'
  mimeType?: string
  size?: number
  fileExtension?: string
  thumbnailLink?: string
}
export interface DriveFile {
  id: string
  name: string
  kind: string
  mimeType: string
  size: number
  parentId: string | null
  fileExtension?: string
  modifiedTime?: string
  imageMediaMetadata?: any
  videoMediaMetadata?: any
  thumbnailLink?: string
}

// GET /drives?token=string
export interface IListDrivesResponse {
  my_drive: { id: string; name: string }
  drives: SharedDrive[]
}

// GET /files?token=string&drive_id=drive_id
export interface IListFilesQuery {
  token?: string
  drive_id?: string
}
export interface IListFilesResponse {
  rootFile: { id: string; name: string }
  files: DriveFile[]
}

// POST /files/import?token=string
export interface ImportedFile {
  id: string
  name: string
  size: number
  fileExtension?: string
}
export interface IImportFilesRequest {
  token: string
  files: ImportedFile[]
}
export interface IImportFilesResponse {
  result: Maybe<{ size: number }>[]
}
