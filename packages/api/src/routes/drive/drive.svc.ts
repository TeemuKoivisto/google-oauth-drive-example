import { Auth, drive_v3, google } from 'googleapis'
import { authenticate } from '@google-cloud/local-auth'
import type { JSONClient } from 'google-auth-library/build/src/auth/googleauth'
import fs from 'fs/promises'
import { Http2Stream } from 'http2'
import path from 'path'

import { config } from '$common/config'

import { Maybe, DriveFile, ImportedFile } from '@my-org/types'
import { GaxiosError } from 'gaxios'
import { Credentials, OAuth2Client } from 'google-auth-library'

const SCOPES = ['https://www.googleapis.com/auth/drive.readonly']
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json')
const TOKEN_PATH = path.join(process.cwd(), 'token.json')

async function saveCredentials(client: Auth.OAuth2Client) {
  const content = await fs.readFile(CREDENTIALS_PATH)
  const keys = JSON.parse(content.toString())
  const key = keys.installed || keys.web
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token
  })
  await fs.writeFile(TOKEN_PATH, payload)
}

async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH)
    const credentials = JSON.parse(content.toString())
    return google.auth.fromJSON(credentials)
  } catch (err) {
    return null
  }
}

async function fetchDriveFiles(
  drive: drive_v3.Drive,
  files: drive_v3.Schema$File[],
  nextPageToken?: string | undefined,
  iters = 0
): Promise<drive_v3.Schema$File[]> {
  const res = await drive.files.list({
    pageSize: 1000,
    q: 'mimeType contains "image/" or mimeType = "application/vnd.google-apps.folder"',
    pageToken: nextPageToken,
    orderBy: 'modifiedTime',
    fields:
      'nextPageToken, files(id, name, kind, mimeType, driveId, teamDriveId, fileExtension, modifiedTime, parents, size, imageMediaMetadata, videoMediaMetadata, thumbnailLink)'
  })
  if (res.data.files) {
    files = [...files, ...res.data.files]
  }
  if (res.data.nextPageToken && iters < 5) {
    return fetchDriveFiles(drive, files, res.data.nextPageToken, iters + 1)
  }
  return files
}

async function download(
  drive: drive_v3.Drive,
  file: ImportedFile
): Promise<Maybe<{ size: number }>> {
  let resp
  try {
    resp = await drive.files.get({ fileId: file.id, alt: 'media' }, { responseType: 'stream' })
    // console.log('fetched ', resp)
    const data = resp.data as any as Http2Stream
    await fs.writeFile(path.join(process.cwd(), 'tmp/', file.name), data)
    return {
      data: {
        size: file.size || 0
      }
    }
  } catch (err: any) {
    let msg, code
    console.error(err)
    if (err instanceof GaxiosError) {
      // Gaxios returns error messages in non-standard form which is easiest to parse with hacky code like this
      const stack = err.stack || ''
      const start = stack.slice(stack.indexOf("message: '") + "message: '".length)
      msg = start.slice(0, stack.indexOf("',") - "',".length - 1)
    }
    try {
      code = parseInt(err?.code)
    } catch (e) {}
    return { err: msg || err, code: code || resp?.status || 500 }
  }
}

export const driveService = {
  async promptOAuth(): Promise<JSONClient | OAuth2Client> {
    // You could save the credentials as token.json but that is kinda pointless as they are configured only for
    // a SINGLE user. Why it's done so in the example https://developers.google.com/drive/api/quickstart/nodejs
    // I don't know but it's not how you should do it.

    // let client: JSONClient | OAuth2Client | null = await loadSavedCredentialsIfExist()
    // if (client) {
    //   return client
    // }
    const client = await authenticate({
      scopes: SCOPES,
      keyfilePath: CREDENTIALS_PATH
    })
    // if (client.credentials) {
    //   await saveCredentials(client)
    // }
    return client
  },
  createClient(credentials?: Auth.Credentials): Auth.OAuth2Client {
    const client = new Auth.OAuth2Client(
      config.GOOGLE.CLIENT_ID,
      config.GOOGLE.CLIENT_SECRET,
      'http://localhost:5274/callback'
    )
    if (credentials) {
      client.setCredentials(credentials)
    }
    return client
  },
  async listFiles(
    authClient: JSONClient | Auth.OAuth2Client
  ): Promise<Maybe<{ rootFile: { id: string; name: string }; files: DriveFile[] }>> {
    const drive = google.drive({
      version: 'v3',
      auth: authClient
    })
    const fetchedRootFile = await drive.files.get({
      fileId: 'root',
      fields: 'id, name'
    })
    const files = await fetchDriveFiles(drive, [])
    if (files?.length === 0 || !files) {
      return { err: 'No files found ', code: 400 }
    }
    return {
      data: {
        rootFile: {
          id: fetchedRootFile.data.id || '',
          name: fetchedRootFile.data.name || 'My drive'
        },
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
  },
  async downloadFiles(
    files: ImportedFile[],
    authClient: Auth.OAuth2Client
  ): Promise<Maybe<{ size: number }>[]> {
    const drive = google.drive({
      version: 'v3',
      auth: authClient,
      http2: true
    })
    return Promise.all(files.map(f => download(drive, f)))
  }
}
