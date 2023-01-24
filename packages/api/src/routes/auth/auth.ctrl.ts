import { ILoginParams, ILoginResponse } from '@my-org/types'
import { NextFunction, Request, Response } from 'express'
import Joi, { valid } from 'joi'

import { CustomError, log } from '$common'
import { generateLoginPayload } from '$jwt'
import { IRequest } from '$typings/request'

import { authService } from './auth.svc'

export const LOGIN_SCHEMA = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(255).required()
})

export const login = async (
  req: IRequest<ILoginParams>,
  res: Response<ILoginResponse>,
  next: NextFunction
) => {
  try {
    const resp = await authService.loginUser(req.body)
    if ('err' in resp) {
      return next(new CustomError(resp.err, resp.code))
    }
    res.json({
      user: resp.data,
      jwt: generateLoginPayload(resp.data)
    })
  } catch (err) {
    next(err)
  }
}
