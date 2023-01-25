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
  console.log('loadCredentials')
  try {
    const content = await fs.readFile(TOKEN_PATH)
    const credentials = JSON.parse(content.toString())
    return google.auth.fromJSON(credentials)
  } catch (err) {
    return null
  }
}

export const driveService = {
  listFiles0(token: string): GaxiosPromise<drive_v3.Schema$FileList> {
    const drive = new drive_v3.Drive({
      auth: token
    })
    return drive.files.list({})
  },
  async listFiles2(token: string): GaxiosPromise<drive_v3.Schema$FileList> {
    const cli = new Auth.OAuth2Client(config.GOOGLE.CLIENT_ID, config.GOOGLE.CLIENT_SECRET)
    cli.setCredentials({
      access_token: token
    })
    const url = cli.generateAuthUrl({
      // 'online' (default) or 'offline' (gets refresh_token)
      // access_type: 'offline',
      // If you only need one scope you can pass it as a string
      scope: ['https://www.googleapis.com/auth/drive.readonly']
    })

    const resp = await cli.getAccessToken()
    console.log('resp', resp)
    const drive = new drive_v3.Drive({
      auth: cli
    })
    return drive.files.list({})
  },
  async authorize(): Promise<JSONClient | OAuth2Client> {
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
    console.log(client.credentials)
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
      fields: 'nextPageToken, files(id, name, kind, mimeType)'
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
        mimeType: f.mimeType || ''
      }))
    }
  }
}
