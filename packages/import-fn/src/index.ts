import functions from '@google-cloud/functions-framework'

import { createClient } from './createOauthClient'
import { fetchDrives } from './fetchDrives'

functions.http('helloHttp', async (req, res) => {
  const { token } = req.query
  if (typeof token !== 'string') {
    return res
      .status(400)
      .json({ err: 'You should provide GDrive access_token as "token" query parameter!' })
  }
  const client = createClient()
  client.setCredentials({
    access_token: token,
    scope: 'https://www.googleapis.com/auth/drive.readonly',
    token_type: 'Bearer'
  })
  const resp = await fetchDrives(client)
  if ('err' in resp) {
    return res.status(resp.code).json(resp)
  }
  res.send(resp)
})
