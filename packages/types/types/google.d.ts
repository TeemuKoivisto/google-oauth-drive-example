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
  thumbnailLink?: string
}
export interface SharedFiles {
  id: 'shared-files'
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

// GET /files?token=string
export interface IListFilesQuery {
  token?: string
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
  result: Maybe<boolean>[]
}
