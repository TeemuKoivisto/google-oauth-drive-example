import { Auth, drive_v3, google } from 'googleapis'

import { Maybe } from '@my-org/types'
import type { GaxiosPromise } from 'googleapis/build/src/apis/abusiveexperiencereport'

export const driveService = {
  listFiles(token: string): GaxiosPromise<drive_v3.Schema$FileList> {
    const drive = new drive_v3.Drive({
      auth: token
    })
    return drive.files.list({})
  }
}
