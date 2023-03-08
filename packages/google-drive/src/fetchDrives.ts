import { drive_v3, google } from 'googleapis'

import { IListDrivesResponse, RootFolderKind } from '@my-org/types'
import { Result } from '@my-org/types'

import { wrapGaxios } from './wrapGaxios'

export async function fetchDrives(
  authClient: drive_v3.Options['auth']
): Promise<Result<IListDrivesResponse>> {
  const drive = google.drive({
    version: 'v3',
    auth: authClient
  })
  const [myDriveResp, driveListResp] = await Promise.all([
    wrapGaxios(
      drive.files.get({
        fileId: 'root',
        fields: 'id, name'
      })
    ),
    wrapGaxios(
      drive.drives.list({
        pageSize: 100,
        fields: '*'
      })
    )
  ])
  if ('err' in myDriveResp) {
    return myDriveResp
  } else if ('err' in driveListResp) {
    return driveListResp
  }
  return {
    data: {
      my_drive: {
        id: myDriveResp.data.id || 'my-drive',
        name: myDriveResp.data.name || 'My drive'
      },
      drives:
        driveListResp.data.drives?.map(d => ({
          id: d.id || 'shared-drive',
          name: d.name || 'Shared drive',
          kind: RootFolderKind.shared_drive,
          backgroundImage: d.backgroundImageLink || undefined,
          color: d.colorRgb || undefined
        })) || []
    }
  }
}
