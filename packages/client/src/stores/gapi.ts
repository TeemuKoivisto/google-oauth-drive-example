/// <reference types="@types/gapi" />;
/// <reference types="@maxim_mazurok/gapi.client.drive"" />;

import { derived, get, writable } from 'svelte/store'
import { persistedWritable } from './persist'

import * as fileApi from '$api/file'

import type { Maybe, DriveFile, MyDrive, SharedFiles, FileRoot } from '@my-org/types'

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
export const files = writable<DriveFile[]>([])
export const fileTree = writable<Map<string, DriveFile[]>>(new Map())
export const rootFile = writable<FileRoot>({
  isRoot: true,
  my_drive: null,
  shared: null
})
export const selectedFiles = writable<boolean[]>([])
export const allSelected = derived(selectedFiles, sf => sf.length > 0 && sf.every(v => v))

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
              // console.log('auth res', res)
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
      files.set(resp.files)
      selectedFiles.set(resp.files.map(() => true))
    }
    console.log('client data ', resp)
    return { data: resp }
  },
  async listFromAPI(apiOnly = true) {
    let resp
    if (apiOnly) {
      resp = await fileApi.listFiles({ token: '', expires: 0 })
    } else {
      const { access_token, expires_in } = get(googleCredentials) || {}
      const query = {
        token: access_token || '',
        expires: expires_in || 0
      }
      resp = await fileApi.listFiles(query)
    }
    if ('data' in resp) {
      const { files: fetched, rootFile: myDrive } = resp.data
      files.set(fetched)
      const m = new Map<string, DriveFile[]>()
      let folders: DriveFile[] = []
      fetched.forEach(f => {
        const parentId = f.parentId || 'shared-files'
        const prev = m.get(parentId)
        if (prev) {
          m.set(parentId, [...prev, f])
        } else {
          m.set(parentId, [f])
        }
        if (f.mimeType === 'application/vnd.google-apps.folder') {
          folders.push(f)
        }
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
      fileTree.set(m)
      rootFile.set({
        isRoot: true,
        my_drive: { ...myDrive, kind: '__my-drive__' },
        shared: { id: 'shared-files', name: 'Shared with me', kind: '__shared__' }
      })
      selectedFiles.set(fetched.map(() => true))
    }
    console.log('api data ', resp)
    return resp
  },
  selectFiles(files: number[], selected = true) {
    selectedFiles.update(old =>
      old.map((prev, idx) => {
        if (selected && files.includes(idx)) {
          return true
        } else if (!selected && files.includes(idx)) {
          return false
        }
        return prev
      })
    )
  },
  async importFiles() {
    const { access_token, expires_in } = get(googleCredentials) || {}
    if (!access_token || !expires_in) {
      return { err: 'Unauthenticated', code: 401 }
    }
    const selected = get(selectedFiles)
    const imported = get(files).filter((_, idx) => selected[idx])
    const resp = await fileApi.importFiles({
      token: access_token,
      expires: expires_in,
      files: imported
    })
    if ('data' in resp) {
    }
    console.log('imported data ', resp)
  }
}
