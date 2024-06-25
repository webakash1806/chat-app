import { Router } from 'express'
import upload from '../middleware/multer.middleware.js'
import {
    changePassword,
    login,
    logout,
    register,
    updateProfile
} from '../controller/auth.controller.js'
import loginAuth from '../middleware/login.middleware.js'
import { isLoggedIn } from '../middleware/auth.middleware.js'

const router = Router()

router.post('/register', upload.single('avatar'), loginAuth, register)
router.post('/login', loginAuth, login)
router.get('/logout', logout)
router.put('/change-password', isLoggedIn, changePassword)
router.put('/update-profile', isLoggedIn, upload.single('avatar'), updateProfile)

export default router