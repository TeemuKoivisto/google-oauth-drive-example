import { NextFunction, Request, Response } from 'express'

import { IListFilesResponse } from '@my-org/types'
import { IRequest } from '$typings/request'

import { CustomError, log } from '$common'
import { driveService } from './drive.svc'

export const listDriveFiles = async (
  req: IRequest,
  res: Response<IListFilesResponse>,
  next: NextFunction
) => {
  try {
    // const resp = await driveService.listFiles3(req.params.token)
    const client = await driveService.authorize()
    const resp = await driveService.listFiles3(client)
    if ('err' in resp) {
      return next(new CustomError(resp.err, resp.code))
    }
    res.json({
      files: resp.data
    })
  } catch (err) {
    next(err)
  }
}
