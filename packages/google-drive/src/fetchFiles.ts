import { Auth, drive_v3, google } from 'googleapis'

import { DriveFile } from '@my-org/types'
import { Result } from '@my-org/types'

async function fetchDriveFiles(
  params: drive_v3.Params$Resource$Files$List,
  drive: drive_v3.Drive,
  files: drive_v3.Schema$File[],
  nextPageToken?: string | undefined
): Promise<drive_v3.Schema$File[]> {
  const res = await drive.files.list({ ...params, pageToken: nextPageToken })
  if (res.data.files) {
    files = [...files, ...res.data.files]
  }
  if (res.data.nextPageToken) {
    return fetchDriveFiles(params, drive, files, res.data.nextPageToken)
  }
  return files
}

export async function fetchFiles(
  authClient: drive_v3.Options['auth'],
  driveId?: string
): Promise<Result<{ files: DriveFile[] }>> {
  const drive = google.drive({
    version: 'v3',
    auth: authClient
  })
  const params: drive_v3.Params$Resource$Files$List = {
    pageSize: 1000,
    q: '(mimeType contains "image/" or mimeType = "application/vnd.google-apps.folder") and not trashed',
    orderBy: 'modifiedTime',
    includeItemsFromAllDrives: true,
    supportsAllDrives: true,
    fields:
      'nextPageToken, files(id, name, kind, mimeType, driveId, teamDriveId, fileExtension, modifiedTime, parents, size, imageMediaMetadata, videoMediaMetadata, thumbnailLink)'
  }
  if (driveId === 'shared-with-me' && params.q) {
    params.q = `${params.q} and not 'me' in owners`
  } else if (!driveId && params.q) {
    params.q = `${params.q} and 'me' in owners`
  } else {
    params.driveId = driveId
    params.corpora = 'drive'
  }
  const files = await fetchDriveFiles(params, drive, [])
  return {
    data: {
      files: files.map(f => ({
        id: f.id || '',
        name: f.name || '',
        kind: f.kind || '',
        mimeType: f.mimeType || '',
        parentId: f.parents ? f.parents[0] : null,
        size: f.size ? parseInt(f.size) : 0,
        fileExtension: f.fileExtension || undefined,
        modifiedTime: f.modifiedTime || undefined,
        imageMediaMetadata: f.imageMediaMetadata || undefined,
        videoMediaMetadata: f.videoMediaMetadata || undefined,
        thumbnailLink: f.thumbnailLink || undefined
      }))
    }
  }
}
