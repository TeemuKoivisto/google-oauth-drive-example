/// <reference types="@types/gapi" />;
/// <reference types="@maxim_mazurok/gapi.client.drive"" />;

import { derived, get, writable } from 'svelte/store'
import { persistedWritable } from './persist'

import * as fileApi from '$api/file'

import { RootFolderKind } from '@my-org/types'
import type { Maybe, SharedDrive, DriveFile, FileRoot } from '@my-org/types'

import { GOOGLE_CLIENT_ID } from '../config'

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.readonly'

// https://developers.google.com/drive/api/v3/reference

interface GoogleCredentials {
  access_token: string
  expires_in: number
  scope: string
  token_type: string
}

export const googleCredentials = persistedWritable<GoogleCredentials | null>(null, {
  key: 'google-credentials',
  storage: 'session'
})
export const renderedButton = writable<HTMLElement | null>(null)
export const sharedDrives = writable<SharedDrive[]>([])
export const filesMap = writable<Map<string, DriveFile>>(new Map())
export const fileTree = writable<Map<string, DriveFile[]>>(new Map())
export const fileTreeRoot = writable<FileRoot>({
  isRoot: true,
  my_drive: null,
  drives: [],
  shared_with_me: null
})
export const fetchedRootFolders = writable<Set<string>>(new Set())
export const selectedFiles = writable<Map<string, boolean>>(new Map())

let authLoaded = false,
  gapiLoaded = false

export const gapiActions = {
  setRenderContainer(el: HTMLElement) {
    renderedButton.set(el)
  },
  appendScript(id: string, src: string): Promise<boolean> {
    return new Promise(resolve => {
      const gapiAuthScript = document.createElement('script')
      gapiAuthScript.id = id
      gapiAuthScript.src = src
      gapiAuthScript.onload = () => resolve(true)
      gapiAuthScript.onerror = () => resolve(false)
      document.body.appendChild(gapiAuthScript)
    })
  },
  async loadAuth() {
    try {
      if (!authLoaded) {
        authLoaded = await this.appendScript('gapi-auth', 'https://accounts.google.com/gsi/client')
      }
      if (authLoaded && !google.accounts.oauth2.hasGrantedAllScopes(DRIVE_SCOPE)) {
        await new Promise(resolve => {
          const client = google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: DRIVE_SCOPE,
            callback: res => {
              console.log('auth res', res)
              const body = res as any
              googleCredentials.set({
                access_token: res.access_token,
                expires_in: body['expires_in'] || 1,
                scope: body['scope'] || 'https://www.googleapis.com/auth/drive.readonly',
                token_type: body['token_type'] || 'Bearer'
              })
              resolve(true)
            }
          })
          client.requestAccessToken()
        })
      }
      return true
    } catch (err) {
      console.error(err)
    }
    return false
  },
  // async loadDrive() {
  //   try {
  //     if (!gapiLoaded) {
  //       gapiLoaded = await this.appendScript(
  //         'gapi-platform',
  //         'https://accounts.google.com/gsi/client'
  //       )
  //     }
  //     if (gapiLoaded) {
  //       console.log('loadDrive')
  //       await new Promise(resolve => {
  //         window.google.accounts.id.initialize({
  //           client_id: GOOGLE_CLIENT_ID,
  //           callback: async (res: CredentialResponse) => {
  //             console.log('cb res', res)
  //             // access_token = res.credential || ''
  //             resolve(res)
  //           }
  //         })
  //         const el = get(renderedButton)
  //         if (el) {
  //           window.google.accounts.id.renderButton(el, {
  //             size: 'medium',
  //             type: 'standard'
  //           })
  //         }
  //       })
  //     }
  //     return true
  //   } catch (err) {
  //     console.error(err)
  //   }
  //   return false
  // },
  // async load() {
  //   try {
  //     const auth = await this.loadAuth()
  //     if (auth) {
  //       await this.loadDrive()
  //     }
  //   } catch (err) {
  //     console.error(err)
  //   }
  // },
  async listInClient(): Promise<Maybe<DriveFile[]>> {
    const cred = get(googleCredentials)
    const token = cred?.access_token || ''
    if (!token) {
      return { err: 'Not authenticated', code: 401 }
    }
    const fetched = await fetch('https://www.googleapis.com/drive/v3/files', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    const resp = await fetched.json()
    if ('files' in resp) {
      filesMap.set(new Map([resp.files.map((f: any) => [f.id, f])]))
      selectedFiles.set(resp.files.map((f: any) => [f.id, false]))
    }
    console.log('client data ', resp)
    return { data: resp }
  },
  async listFromAPI() {
    const creds = get(googleCredentials)
    googleCredentials.set(null)
    const resp = await this.listFiles('')
    googleCredentials.set(creds)
    return resp
  },
  selectFiles(ids: string[], selected = true) {
    const tree = get(fileTree)
    const newSelected = get(selectedFiles)
    let processed = ids
    while (processed.length > 0) {
      processed = processed.reduce((acc, id) => {
        newSelected.set(id, selected)
        const children = tree.get(id)
        if (children) {
          children.forEach(child => {
            acc.push(child.id)
          })
        }
        return acc
      }, [] as string[])
    }
    // console.log('setSelected ', newSelected)
    selectedFiles.set(newSelected)
  },
  async importFiles() {
    const { access_token } = get(googleCredentials) || {}
    if (!access_token) {
      return { err: 'Unauthenticated', code: 401 }
    }
    const selected = get(selectedFiles)
    const imported = Array.from(get(filesMap).values())
      .filter(f => selected.get(f.id))
      .map(f => ({
        id: f.id,
        name: f.name,
        size: f.size,
        fileExtension:
          f.mimeType !== 'application/vnd.google-apps.folder' ? f.fileExtension : undefined
      }))
    const resp = await fileApi.importFiles({
      token: access_token,
      files: imported
    })
    if ('data' in resp) {
    }
    console.log('imported data ', resp)
  },
  async listDrives() {
    const { access_token } = get(googleCredentials) || {}
    if (!access_token) {
      return { err: 'Unauthenticated', code: 401 }
    }
    const resp = await fileApi.listDrives(access_token)
    if ('data' in resp) {
      sharedDrives.set(resp.data.drives)
      fileTreeRoot.set({
        isRoot: true,
        my_drive: { ...resp.data.my_drive, kind: RootFolderKind.my_drive },
        drives: resp.data.drives,
        shared_with_me: {
          id: 'shared-with-me',
          name: 'Shared with me',
          kind: RootFolderKind.shared_with_me
        }
      })
      fetchedRootFolders.set(new Set())
    }
    console.log('listed drives data ', resp)
    return resp
  },
  async listFiles(driveId: string, kind: RootFolderKind = RootFolderKind.my_drive) {
    const { access_token } = get(googleCredentials) || {}
    const resp = await fileApi.listFiles({
      token: access_token || '',
      drive_id: kind === RootFolderKind.my_drive ? undefined : driveId
    })
    if ('data' in resp) {
      const allFilesMap = get(filesMap)
      const { files: fetched } = resp.data
      const m = new Map<string, DriveFile[]>()
      let folders: DriveFile[] = []
      fetched.forEach(f => {
        if (allFilesMap.has(f.id)) return
        const parentId = f.parentId || 'shared-with-me'
        const prev = m.get(parentId)
        if (prev) {
          m.set(parentId, [...prev, f])
        } else {
          m.set(parentId, [f])
        }
        if (f.mimeType === 'application/vnd.google-apps.folder') {
          folders.push(f)
        }
        allFilesMap.set(f.id, f)
      })
      while (true) {
        let nochanges = true
        const unchangedFolders: DriveFile[] = []
        folders.forEach(f => {
          const found = m.get(f.id)
          if (!found && f.parentId) {
            const prev = m.get(f.parentId)
            if (prev) {
              m.set(f.parentId, prev?.filter(ff => ff.id !== f.id) || [])
              nochanges = false
            }
          } else {
            unchangedFolders.push(f)
          }
        })
        folders = unchangedFolders
        if (nochanges) {
          break
        }
      }
      filesMap.set(allFilesMap)
      fileTree.update(old => new Map([...old, ...m]))
      selectedFiles.update(
        old => new Map([...old, ...fetched.map(f => [f.id, false] as [string, boolean])])
      )
      if (kind === RootFolderKind.my_drive) {
        const id = get(fileTreeRoot).my_drive?.id
        id && fetchedRootFolders.update(v => v.add(id))
      } else if (driveId) {
        fetchedRootFolders.update(v => v.add(driveId))
      }
      // Trigger updating of FileTree's svelte-tree-view
      fileTreeRoot.update(v => ({ ...v }))
    }
    console.log('api data ', resp)
    return resp
  }
}
