/// <reference types="@types/gapi" />;
/// <reference types="@maxim_mazurok/gapi.client.drive"" />;

import { derived, get, writable } from 'svelte/store'
import { persistedWritable } from './persist'

import * as fileApi from '$api/file'

import type { DriveFile } from '@my-org/types'

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
export const accessToken = persistedWritable<string>('', {
  key: 'access-token',
  storage: 'session'
})
export const renderedButton = writable<HTMLElement | null>(null)
export const files = writable<DriveFile[]>([])

let authLoaded = false,
  gapiLoaded = false,
  access_token = ''

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
      console.log('loaded', authLoaded)
      console.log('scopes', google.accounts.oauth2.hasGrantedAllScopes(DRIVE_SCOPE))
      if (authLoaded && !google.accounts.oauth2.hasGrantedAllScopes(DRIVE_SCOPE)) {
        console.log('loadAuth')
        await new Promise(resolve => {
          const client = google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: DRIVE_SCOPE,
            callback: res => {
              console.log('auth res', res)
              access_token = res.access_token
              accessToken.set(res.access_token)
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
          console.log('client in promise', client)
        })
      }
      return true
    } catch (err) {
      console.error(err)
    }
    return false
  },
  async loadDrive() {
    try {
      if (!gapiLoaded) {
        gapiLoaded = await this.appendScript(
          'gapi-platform',
          'https://accounts.google.com/gsi/client'
        )
      }
      if (gapiLoaded) {
        console.log('loadDrive')
        await new Promise(resolve => {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: async (res: CredentialResponse) => {
              console.log('cb res', res)
              access_token = res.credential || ''
              resolve(res)
            }
          })
          const el = get(renderedButton)
          if (el) {
            window.google.accounts.id.renderButton(el, {
              size: 'medium',
              type: 'standard'
            })
          }
        })
      }
      return true
    } catch (err) {
      console.error(err)
    }
    return false
  },
  async load() {
    try {
      const auth = await this.loadAuth()
      if (auth) {
        await this.loadDrive()
      }
    } catch (err) {
      console.error(err)
    }
  },
  async listInClient() {
    const fetched = await fetch('https://www.googleapis.com/drive/v3/files', {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    })
    const data = await fetched.json()
    console.log('client data ', data)
  },
  async listFromAPI(apiOnly = true) {
    let resp
    if (apiOnly) {
      resp = await fileApi.listFiles('', 0)
    } else {
      const cred = get(googleCredentials)
      resp = await fileApi.listFiles(cred?.access_token || '', cred?.expires_in || 0)
    }
    if ('data' in resp) {
      files.set(resp.data.files)
    }
    console.log('data ', resp)
  }
}
