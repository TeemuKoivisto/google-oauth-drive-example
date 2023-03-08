# GCP Cloud function with Google Drive API

Based on:

- https://cloud.google.com/functions/docs/create-deploy-gcloud

## Set up your local GCP account

Required to run PubSub inside GCP. You can also use emulator, check the `packages/pubsub` package.

From https://cloud.google.com/pubsub/docs/stream-messages-dataflow

1. Run the script: `./gcp.sh`
2. Visit the Console: https://console.cloud.google.com/iam-admin/serviceaccounts
3. Add a key to the created service
4. Download the key and save it to the root of this folder as `credentials.json`

## How to run locally

1. Copy the env: `cp .env-example .env`
2. Run: `pnpm --filter import-fn build`
3. Run: `pnpm --filter import-fn start`
4. Should start app at: http://localhost:7086
5. Run: `./curl.sh` to test publishing to PubSub -> TODO use client to trigger the function

## How to deploy

1. First login to your GCP account: `gcloud auth login`
2. Create a function from function dashboard
3. Config this shit
4. Run: `pnpm --filter import-fn build`
5. Deploy: `pnpm --filter import-fn depl`
6. Visit the URL

https://drive-import-i3z5yglria-lz.a.run.app/?token=
