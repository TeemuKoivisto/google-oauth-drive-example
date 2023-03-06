export type Ok<T> = {
  data: T
}
export type Err = {
  err: string
  code: number
}
// Based on Rust's Result https://doc.rust-lang.org/std/result/
export type Result<T> = Ok<T> | Err

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

export enum RootFolderKind {
  my_drive = '#my_drive',
  shared_drive = '#shared_drive',
  shared_with_me = '#shared_with_me'
}
export interface FileRoot {
  isRoot: true
  my_drive: MyDrive | null
  drives: SharedDrive[]
  shared_with_me: SharedWithMe | null
}
export interface MyDrive {
  id: string
  name: string
  kind: RootFolderKind.my_drive
  mimeType?: string
  size?: number
  fileExtension?: string
  thumbnailLink?: string
}
export interface SharedDrive {
  id: string
  name: string
  kind: RootFolderKind.shared_drive
  backgroundImage?: string
  color?: string
  size?: number
  fileExtension?: string
  thumbnailLink?: string
}
export interface SharedWithMe {
  id: 'shared-with-me'
  name: string
  kind: RootFolderKind.shared_with_me
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
  result: Result<{ size: number }>[]
}
