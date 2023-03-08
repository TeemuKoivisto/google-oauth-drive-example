import { Auth, google } from 'googleapis'
import path from 'path'
import fs from 'fs/promises'

import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_OAUTH_CALLBACK_URL } from './config'

// Copied from google-auth-library/build/src/auth/googleauth since it's not exported for some reason
export declare type JSONClient =
  | Auth.JWT
  | Auth.UserRefreshClient
  | Auth.BaseExternalAccountClient
  | Auth.Impersonated

const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json')

export function createClient(credentials?: Auth.Credentials): Auth.OAuth2Client {
  const client = new Auth.OAuth2Client(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_OAUTH_CALLBACK_URL
  )
  if (credentials) {
    client.setCredentials(credentials)
  }
  return client
}

export async function readJsonCredentials(): Promise<JSONClient | null> {
  try {
    const content = await fs.readFile(CREDENTIALS_PATH)
    const credentials = JSON.parse(content.toString())
    return google.auth.fromJSON(credentials)
  } catch (err) {
    return null
  }
}
