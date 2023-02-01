import { Router } from 'express'

import { authenticate, validateBody } from '$middlewares'

import * as authCtrl from './routes/auth/auth.ctrl'
import * as driveCtrl from './routes/drive/drive.ctrl'

const router = Router()

router.post('/login', validateBody(authCtrl.LOGIN_SCHEMA), authCtrl.login)
router.get('/drives', driveCtrl.listDrives)
router.get('/files', driveCtrl.listDriveFiles)
router.post('/files/download', driveCtrl.importDriveFiles)

export default router
