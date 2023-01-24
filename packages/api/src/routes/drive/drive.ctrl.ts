import { NextFunction, Request, Response } from 'express'

import { IRequest } from '$typings/request'

import { driveService } from './drive.svc'

export const listDriveFiles = async (req: IRequest, res: Response, next: NextFunction) => {
  try {
    // const resp = await driveService.listFiles3(req.params.token)
    const client = await driveService.authorize()
    const resp = await driveService.listFiles3(client)
    res.json(resp)
  } catch (err) {
    next(err)
  }
}
