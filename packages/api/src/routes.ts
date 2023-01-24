import { Router } from 'express'

import { authenticate, validateBody } from '$middlewares'

import * as authCtrl from './routes/auth/auth.ctrl'

const router = Router()

router.post('/login', validateBody(authCtrl.LOGIN_SCHEMA), authCtrl.login)

export default router
