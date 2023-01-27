import { Auth, drive_v3, google } from 'googleapis'
import { authenticate } from '@google-cloud/local-auth'
import type { JSONClient } from 'google-auth-library/build/src/auth/googleauth'
import fs from 'fs/promises'
import path from 'path'

import { config } from '$common/config'

import { Maybe, DriveFile } from '@my-org/types'
import type { GaxiosPromise } from 'googleapis/build/src/apis/abusiveexperiencereport'
import { OAuth2Client } from 'google-auth-library'

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
  createClient(): Auth.OAuth2Client {
    return new Auth.OAuth2Client(
      config.GOOGLE.CLIENT_ID,
      config.GOOGLE.CLIENT_SECRET,
      'http://localhost:5274/callback'
    )
  },
  async listFiles(authClient: JSONClient | Auth.OAuth2Client): Promise<Maybe<DriveFile[]>> {
    const drive = google.drive({
      version: 'v3',
      auth: authClient
    })
    const res = await drive.files.list({
      pageSize: 10,
      q: '"root" in parents',
      fields: 'nextPageToken, files(id, name, kind, mimeType, size)'
    })
    const files = res.data.files
    if (files?.length === 0 || !files) {
      return { err: 'No files found ', code: 400 }
    }
    return {
      data: files.map(f => ({
        id: f.id || '',
        name: f.name || '',
        kind: f.kind || '',
        mimeType: f.mimeType || '',
        size: f.size || ''
      }))
    }
  },
  async download(drive: drive_v3.Drive, file: DriveFile): Promise<Maybe<boolean>> {
    try {
      const resp = await drive.files.get({ fileId: file.id, alt: 'media' })
      const data = resp.data as any
      await fs.writeFile(path.join(process.cwd(), 'tmp/', file.name), data)
      return { data: resp.data.size || data.length || 0 }
    } catch (err: any) {
      console.error(err)
      return { err: err?.message || err, code: err?.code || 500 }
    }
  },
  async downloadFiles(
    files: DriveFile[],
    authClient: Auth.OAuth2Client
  ): Promise<Maybe<boolean>[]> {
    const drive = google.drive({
      version: 'v3',
      auth: authClient,
      http2: true
    })
    console.log('files', files)
    async function download(file: DriveFile): Promise<Maybe<boolean>> {
      try {
        const resp = await drive.files.get({ fileId: file.id, alt: 'media' })
        console.log('fetched')
        const data = resp.data as any
        await fs.writeFile(path.join(process.cwd(), 'tmp/', file.name), data)
        console.log('written')
        return { data: resp.data.size || data.length || 0 }
      } catch (err: any) {
        console.error(err)
        return { err: err?.message || err, code: err?.code || 500 }
      }
    }
    return Promise.all(files.map(f => download(f)))
  }
}
