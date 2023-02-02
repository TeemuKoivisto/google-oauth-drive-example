import { NextFunction, Response } from 'express'

import {
  IListDrivesResponse,
  IListFilesQuery,
  IListFilesResponse,
  IImportFilesRequest,
  IImportFilesResponse
} from '@my-org/types'
import { IRequest } from '$typings/request'

import { CustomError, log } from '$common'
import { driveService } from './drive.svc'

export const listDrives = async (
  req: IRequest<{}, {}, { token: string }>,
  res: Response<IListDrivesResponse>,
  next: NextFunction
) => {
  try {
    const { token } = req.query
    const client = driveService.createClient({
      access_token: token,
      scope: 'https://www.googleapis.com/auth/drive.readonly',
      token_type: 'Bearer'
    })
    const resp = await driveService.listDrives(client)
    if ('err' in resp) {
      return next(new CustomError(resp.err, resp.code))
    }
    res.json(resp.data)
  } catch (err) {
    next(err)
  }
}

export const listDriveFiles = async (
  req: IRequest<{}, {}, IListFilesQuery>,
  res: Response<IListFilesResponse>,
  next: NextFunction
) => {
  try {
    const { token, drive_id } = req.query
    let client
    if (token) {
      client = driveService.createClient({
        access_token: token,
        scope: 'https://www.googleapis.com/auth/drive.readonly',
        token_type: 'Bearer'
      })
    } else {
      client = await driveService.promptOAuth()
    }
    const resp = await driveService.listFiles(client, drive_id)
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
    const { files, token } = req.body
    const client = driveService.createClient({
      access_token: token,
      scope: 'https://www.googleapis.com/auth/drive.readonly',
      token_type: 'Bearer'
    })
    const result = await driveService.downloadFiles(files, client)
    res.json({ result })
  } catch (err) {
    next(err)
  }
}
