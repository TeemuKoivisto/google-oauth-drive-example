# [google-oauth-drive-example](https://github.com/TeemuKoivisto/google-oauth-drive-example)

This example shows how to create a basic Google OAuth flow with Google Drive integration as of 2023

Based on https://developers.google.com/drive/api/quickstart/nodejs

## Prerequisites

Node.js >=16 & pnpm installed globally. Google Cloud account.

## Setup

1. Login to your Google Cloud account
2. Create a project or select an existing one at: https://console.cloud.google.com/welcome
3. Go to: https://console.cloud.google.com/apis/credentials
4. Click `CREATE CREDENTIALS` and pick `OAuth client ID`
5. Pick `Web application`
6. To `Authorised JavaScript origins` add: `http://localhost:5174`
7. To `Authorised redirect URIs` add: `http://localhost:5274/callback`
8. Click `CREATE`. Download your credentials
9. Copy `.env-example` in `packages/api` to `packages/api/.env` and replace `CLIENT_ID` & `CLIENT_SECRET` with your values
10. Enable Google Drive API: https://console.cloud.google.com/marketplace/product/google/drive.googleapis.com
11. Copy `packages/client/.env-example` to `packages/client/.env`
12. You're good to go!

## Run the example

1. First: `pnpm i`
2. Launch the API: `pnpm api`
3. And client in another terminal: `pnpm client`
4. Go to `http://localhost:5174/login`
5. Click `Sign in with Google`
6. Follow consent screen, you should be redirected to `http://localhost:5174`
7. Click `List files` to fetch files from your Google Drive
8. You should see a list of files
