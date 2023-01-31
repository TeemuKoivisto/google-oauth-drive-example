export interface FileRoot {
  isRoot: true
  my_drive: MyDrive | null
  shared: SharedFiles | null
}
export interface MyDrive {
  id: string
  name: string
  kind: '__my-drive__'
  mimeType?: string
  size?: number
  fileExtension?: string
}
export interface SharedFiles {
  id: 'shared-files'
  name: string
  kind: '__shared__'
  mimeType?: string
  size?: number
  fileExtension?: string
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
  webViewLink?: string
}

// GET /files?token=string&expires=number
export interface IListFilesQuery {
  token?: string
  expires?: number
}
export interface IListFilesResponse {
  rootFile: { id: string; name: string }
  files: DriveFile[]
}

// POST /files/import
export interface IImportFilesRequest {
  token: string
  expires: number
  files: DriveFile[]
}
export interface IImportFilesResponse {
  result: Maybe<boolean>[]
}
