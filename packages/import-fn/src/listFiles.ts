import functions from '@google-cloud/functions-framework'

import { createClient, fetchDrives } from '@my-org/google-drive'

export async function listFiles(
  req: functions.Request,
  res: functions.Response<any, Record<string, any>>
) {
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
}
