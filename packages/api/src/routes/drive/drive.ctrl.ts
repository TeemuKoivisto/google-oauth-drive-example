import { NextFunction, Response } from 'express'

import {
  IListFilesQuery,
  IListFilesResponse,
  IImportFilesRequest,
  IImportFilesResponse
} from '@my-org/types'
import { IRequest } from '$typings/request'

import { CustomError, log } from '$common'
import { driveService } from './drive.svc'

export const listDriveFiles = async (
  req: IRequest<{}, {}, IListFilesQuery>,
  res: Response<IListFilesResponse>,
  next: NextFunction
) => {
  try {
    const { token, expires } = req.query
    let client
    if (token && expires) {
      client = driveService.createClient()
      const credentials = {
        access_token: token,
        scope: 'https://www.googleapis.com/auth/drive.readonly',
        token_type: 'Bearer',
        expires_in: expires
      }
      client.setCredentials(credentials)
    } else {
      client = await driveService.promptOAuth()
    }
    const resp = await driveService.listFiles(client)
    if ('err' in resp) {
      return next(new CustomError(resp.err, resp.code))
    }
    res.json(resp.data)
  } catch (err) {
    next(err)
  }
}

export const importDriveFiles = async (
  req: IRequest<IImportFilesRequest>,
  res: Response<IImportFilesResponse>,
  next: NextFunction
) => {
  try {
    const { files, token, expires } = req.body
    const client = driveService.createClient()
    const credentials = {
      access_token: token,
      scope: 'https://www.googleapis.com/auth/drive.readonly',
      token_type: 'Bearer',
      expires_in: expires
    }
    client.setCredentials(credentials)
    const result = await driveService.downloadFiles(files, client)
    res.json({ result })
  } catch (err) {
    next(err)
  }
}
