import { Auth, drive_v3, google } from 'googleapis'
import { authenticate } from '@google-cloud/local-auth'
import type { JSONClient } from 'google-auth-library/build/src/auth/googleauth'
import fs from 'fs/promises'
import path from 'path'

import { config } from '$common/config'

import { Maybe, DriveFile } from '@my-org/types'
import { GaxiosError } from 'gaxios'
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

async function fetchDriveFiles(
  drive: drive_v3.Drive,
  files: drive_v3.Schema$File[],
  nextPageToken?: string | undefined,
  iters = 0
): Promise<drive_v3.Schema$File[]> {
  const res = await drive.files.list({
    pageSize: 100,
    q: 'mimeType contains "image/" or mimeType = "application/vnd.google-apps.folder"',
    pageToken: nextPageToken,
    orderBy: 'modifiedTime',
    fields:
      'nextPageToken, files(id, name, kind, mimeType, driveId, teamDriveId, fileExtension, modifiedTime, parents, size, imageMediaMetadata, videoMediaMetadata, webViewLink)'
  })
  if (res.data.files) {
    files = [...files, ...res.data.files]
  }
  if (res.data.nextPageToken && iters < 5) {
    return fetchDriveFiles(drive, files, res.data.nextPageToken, iters + 1)
  }
  return files
}

interface TreeNode {
  id: string
  value: drive_v3.Schema$File
  parentId: string | null
  children: string[]
}

function createFileTree(
  currentNode: TreeNode | undefined,
  allFiles: drive_v3.Schema$File[],
  treeMap: Map<string, TreeNode>
) {
  if (!currentNode) return
  const found = allFiles.filter(f => f.parents?.includes(currentNode.id))
  console.log('found', found)
  currentNode.children = found.map(f => f.id || '')
  found.forEach(f => {
    const node: TreeNode = {
      value: f,
      id: f.id || '',
      parentId: currentNode.id,
      children: []
    }
    treeMap.set(node.id, node)
    createFileTree(node, allFiles, treeMap)
  })
}

async function download(drive: drive_v3.Drive, file: DriveFile): Promise<Maybe<boolean>> {
  let resp
  try {
    resp = await drive.files.get({ fileId: file.id, alt: 'media' })
    // console.log('fetched')
    const data = resp.data as any
    await fs.writeFile(path.join(process.cwd(), 'tmp/', file.name), data)
    // console.log('written')
    return { data: resp.data.size || data.length || 0 }
  } catch (err: any) {
    let msg, code
    if (err instanceof GaxiosError) {
      // Gaxios returns error messages in non-standard form which is easiest to parse with hacky code like this
      const stack = err.stack || ''
      const start = stack.slice(stack.indexOf("message: '") + "message: '".length)
      msg = start.slice(0, stack.indexOf("',") - "',".length - 1)
    }
    try {
      code = parseInt(err?.code)
    } catch (e) {}
    return { err: msg || err, code: code || 500 }
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
  async listFiles(
    authClient: JSONClient | Auth.OAuth2Client
  ): Promise<Maybe<{ rootFile: { id: string; name: string }; files: DriveFile[] }>> {
    const drive = google.drive({
      version: 'v3',
      auth: authClient
    })
    // const res = await drive.files.list({
    //   pageSize: 100,
    //   // q: '"root" in parents',
    //   // q: '"root" in parents and (mimeType contains "image/" or mimeType = "application/vnd.google-apps.folder")',
    //   // q: '"root" in parents and (mimeType contains "image/")',
    //   q: 'mimeType contains "image/" or mimeType = "application/vnd.google-apps.folder"',
    //   fields: 'nextPageToken, files(id, name, kind, mimeType, fileExtension, modifiedTime, parents, size, imageMediaMetadata, videoMediaMetadata, webViewLink)'
    // })
    const fetchedRootFile = await drive.files.get({
      fileId: 'root',
      fields: 'id, name'
    })
    const rootNode: TreeNode = {
      value: fetchedRootFile.data,
      id: fetchedRootFile.data.id || '',
      parentId: null,
      children: []
    }
    console.log('rootNode ', rootNode)

    const files = await fetchDriveFiles(drive, [])
    // const files = res.data.files
    if (files?.length === 0 || !files) {
      return { err: 'No files found ', code: 400 }
    }

    // const treeMap = new Map()
    // treeMap.set(rootNode.id, rootNode)
    // createFileTree(rootNode, files, treeMap)
    // console.log('files', files)
    // console.log('\n\ntreeMap ', treeMap)
    // console.log('asdf', res.data.files?.reduce((acc, c) => `${acc},${c.parents}`, ''))
    // @ts-ignore
    // console.log('asdf', res.data.files?.reduce((acc, c) => [...acc, c.parents], []))
    // @ts-ignore
    // console.log('asdf', res.data.files?.reduce((acc, c) => [...acc, c.imageMediaMetadata], []))
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
          webViewLink: f.webViewLink || undefined
        }))
      }
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
    return Promise.all(files.map(f => download(drive, f)))
  }
}
