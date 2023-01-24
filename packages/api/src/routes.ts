import { Router } from 'express'

import { authenticate, validateBody } from '$middlewares'

import * as authCtrl from './routes/auth/auth.ctrl'
import * as driveCtrl from './routes/drive/drive.ctrl'

const router = Router()

router.post('/login', validateBody(authCtrl.LOGIN_SCHEMA), authCtrl.login)
router.get('/files', driveCtrl.listDriveFiles)

export default router
