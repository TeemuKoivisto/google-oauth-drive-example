# [google-oauth-drive-example](https://github.com/TeemuKoivisto/google-oauth-drive-example)

This example shows how to create a basic Google OAuth flow with Google Drive integration as of 2023.

There are three different flows you can use, first is using Drive API directly from the client without API. Works but hard to authenticate data & not possible to run as background tasks. Second is API only, copied directly from their NodeJS example. It's easy to use but it opens the Google login in a separate window and requires using a callback URL which kinda sucks. The third is combination of the two, it first fetches the credentials in the client which the API uses to fetch the data. The best option, IMO.

Used resources:

- https://developers.google.com/drive/api/quickstart/nodejs
- https://developers.google.com/drive/api/v3/reference
- https://bretcameron.medium.com/how-to-use-the-google-drive-api-with-javascript-57a6cc9e5262
- https://cloud.google.com/nodejs/docs/reference/google-auth-library/latest
- https://developers.google.com/identity/gsi/web/guides/personalized-button

## Bugs

There are multitude of errors I received while making this. Some of them that I can still remember are:

### `The incoming JSON object does not contain a client_email field`

This means you are trying to use service account and haven't used your service account email eg ``

### `Error: No access, refresh token, API key or refresh handler callback is set.`

This one threw me off for a long while. It means you haven't configured your credentials properly eg you've only provided an `access_token` but not the full payload:

```js
{
  access_token: token,
  scope: 'https://www.googleapis.com/auth/drive.readonly',
  token_type: 'Bearer',
  expires_in: 3349
}
```

Or something like that.

## Prerequisites

Node.js >=16 & pnpm installed globally. Google Cloud account.

## Setup

1. Login to your Google Cloud account
2. Create a project or select an existing one at: https://console.cloud.google.com/welcome
3. Go to: https://console.cloud.google.com/apis/credentials
4. Click `CREATE CREDENTIALS` and pick `OAuth client ID`
5. Pick `Web application`
6. To `Authorised JavaScript origins` add: `http://localhost:5174`
7. To `Authorised redirect URIs` add: `http://localhost:5274/callback` (TODO: not used properly)
8. Click `CREATE`. Download your credentials
9. Copy `.env-example` in `packages/api` to `packages/api/.env` and replace `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` with your values
10. Enable Google Drive API: https://console.cloud.google.com/marketplace/product/google/drive.googleapis.com
11. Copy `packages/client/.env-example` to `packages/client/.env`. Replace `GOOGLE_CLIENT_ID`
12. You're good to go!

## Run the example

1. First: `pnpm i`
2. Launch the API: `pnpm api`
3. And client in another terminal: `pnpm client`
4. Go to `http://localhost:5174/login`
5. Click `Log in`
6. Click any of the buttons
7. Follow consent screen, bybass the warning if it says the account is not trusted
8. You should see a list of files
