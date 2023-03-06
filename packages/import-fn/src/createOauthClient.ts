import { Auth } from 'googleapis'

import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_OAUTH_CALLBACK_URL } from './config'

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
