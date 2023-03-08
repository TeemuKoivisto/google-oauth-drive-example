import functions from '@google-cloud/functions-framework'
import { PubSub } from '@google-cloud/pubsub'
import { google } from 'googleapis'

import { createClient, readJsonCredentials, fetchFiles } from '@my-org/google-drive'

import { DriveFile, ImportedFile, ImportFilesRequest, Result, RootFolderKind } from '@my-org/types'

const PUBSUB_TOPIC_NAME = 'ImportFromGoogleDrive'

async function doesTopicExist(pubsubClient: PubSub) {
  const topics = await pubsubClient.getTopics()
  const topicExists = topics
    .flat()
    .find(
      topic =>
        topic !== null &&
        'name' in topic &&
        typeof topic.name === 'string' &&
        topic.name.split('/').slice(-1)[0] === PUBSUB_TOPIC_NAME
    )
  return !!topicExists
}

async function publishMessage(pubsubClient: PubSub, file: ImportedFile): Promise<Result<boolean>> {
  const dataBuffer = Buffer.from(JSON.stringify(file))
  try {
    const messageId = await pubsubClient
      .topic(PUBSUB_TOPIC_NAME)
      .publishMessage({ data: dataBuffer })
    console.log(`Message ${messageId} published`)
    return { data: true }
  } catch (error: any) {
    console.error(`Received error while publishing: ${error.message}`)
    process.exitCode = 1
    return { err: error.message, code: 500 }
  }
}

functions.http('helloHttp', async (req, res) => {
  const { files, fetchRootFolders, token } = req.body as ImportFilesRequest
  if (typeof token !== 'string') {
    return res
      .status(400)
      .json({ err: 'You should provide GDrive access_token as "token" in POST body!' })
  }
  const fetched = [] as DriveFile[]
  try {
    const client = createClient()
    client.setCredentials({
      access_token: token,
      scope: 'https://www.googleapis.com/auth/drive.readonly',
      token_type: 'Bearer'
    })
    // Since root folders can be selected without fetching all their files, do it now
    const fetched = (
      await Promise.all(
        fetchRootFolders.map(r =>
          fetchFiles(client, r.kind === RootFolderKind.my_drive ? undefined : r.id)
        )
      )
    ) // Flatten the list & filter all failed requests
      .flat()
      .filter(f => 'data' in f)
      .map(f => ('data' in f ? f.data.files : []))
      .flat()
  } catch (err) {
    // Probably expired access_token, skip the error for now
  }
  const joined = [
    ...fetched.map(f => ({
      id: f.id,
      name: f.name,
      size: f.size,
      fileExtension: f.fileExtension
    })),
    ...files
  ]
  const client = new google.auth.GoogleAuth({
    keyFile: 'credentials.json'
  })
  const pubsubCreds = await readJsonCredentials()
  if (!pubsubCreds) {
    return res.status(500).json({ err: 'Failed to load JSON credentials' })
  }
  // const client = createClient()
  // client.setCredentials(pubsubCreds)
  const pubsubClient = new PubSub({
    auth: client
  })
  // Filter out folders for now
  const filtered = joined.filter(f => f.size !== 0)
  if (!(await doesTopicExist(pubsubClient))) {
    await pubsubClient.createTopic(PUBSUB_TOPIC_NAME)
  }
  const result = await Promise.all(filtered.map(f => publishMessage(pubsubClient, f)))
  if (result.every(r => 'err' in r)) {
    return res.status(500).json(result)
  }
  res.send(result)
})
