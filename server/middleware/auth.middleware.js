import AppError from "../utils/error.utils"
import jwt from 'jsonwebtoken'


const isLoggedIn = async (req, res, next) => {
    try {
        const { token } = await req.cookies

        if (!token) {
            return next(new AppError("Unauthenticated!, Please login again", 400))
        }

        const userDetails = await jwt.verify(token, process.env.JWT_SECRET)

        req.user = userDetails

        next()
    }
    catch (e) {
        return next(new AppError(e.message, 500))
    }
}

const authorizedUser = async (req, res, next) => {
    const userRole = await req.user.role

    if (!role.includes(userRole)) {
        return next(new AppError("Unauthenticated! You don't have permission to access this", 400))
    }

    next()
}

export {
    isLoggedIn,
    authorizedUser
}