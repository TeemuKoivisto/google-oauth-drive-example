import { PubSub } from '@google-cloud/pubsub'

import { PUBSUB_TOPIC_NAME, PUBSUB_SUBSCRIPTION_NAME } from './config'

const pubsubClient = new PubSub()
const timeout = 60

async function createSubscription() {
  // Creates a new subscription
  await pubsubClient.topic(PUBSUB_TOPIC_NAME).createSubscription(PUBSUB_SUBSCRIPTION_NAME)
  console.log(`Subscription ${PUBSUB_SUBSCRIPTION_NAME} created.`)
}

async function doesSubscriptionExist() {
  const subscriptions = await pubsubClient.getSubscriptions()
  const subscriptionExist = subscriptions
    .flat()
    .find(
      sub =>
        sub !== null &&
        'name' in sub &&
        typeof sub.name === 'string' &&
        sub.name.split('/').slice(-1)[0] === PUBSUB_SUBSCRIPTION_NAME
    )
  return !!subscriptionExist
}

const subscription = pubsubClient.subscription(PUBSUB_SUBSCRIPTION_NAME)

let messageCount = 0

const messageHandler = (message: any) => {
  console.log(`message received ${message.id}`)
  console.log(`Data: ${message.data}`)
  messageCount += 1
  message.ack()
}

export async function run() {
  if (!(await doesSubscriptionExist())) {
    await createSubscription().catch(console.error)
  }
  subscription.on(`message`, messageHandler)
  setTimeout(() => {
    subscription.removeListener('message', messageHandler)
    console.log(`${messageCount} message(s) received`)
  }, timeout * 1000)
}
