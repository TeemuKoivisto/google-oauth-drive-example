import { NextFunction, Request, Response } from 'express'

import { IRequest } from '$typings/request'

import { driveService } from './drive.svc'

export const listDriveFiles = async (req: IRequest, res: Response, next: NextFunction) => {
  try {
    const resp = await driveService.listFiles(req.params.token)
    res.json(resp.data)
  } catch (err) {
    next(err)
  }
}
