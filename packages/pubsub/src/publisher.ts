import { PubSub } from '@google-cloud/pubsub'

import { PUBSUB_TOPIC_NAME } from './config'

const pubsubClient = new PubSub()

const data = JSON.stringify({
  userId: '50001',
  companyId: 'acme',
  companyName: 'Acme Company',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@acme.com',
  country: 'US',
  city: 'Austin',
  status: 'Active',
  effectiveDate: '11/11/2021',
  department: 'sales',
  title: 'Sales Lead'
})
async function createTopic() {
  // Creates a new topic
  await pubsubClient.createTopic(PUBSUB_TOPIC_NAME)
  console.log(`Topic ${PUBSUB_TOPIC_NAME} created.`)
}

async function doesTopicExist() {
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

async function publishMessage() {
  const dataBuffer = Buffer.from(data)
  try {
    const messageId = await pubsubClient
      .topic(PUBSUB_TOPIC_NAME)
      .publishMessage({ data: dataBuffer })
    console.log(`Message ${messageId} published`)
  } catch (error: any) {
    console.error(`Received error while publishing: ${error.message}`)
    process.exitCode = 1
  }
}

export async function run() {
  if (!(await doesTopicExist())) {
    await createTopic()
  }
  await publishMessage()
}
