import AppError from "../utils/error.utils"


const loginAuth = async (req, res, next) => {
    const { token } = await req.cookies

    if (token) {
        return next(new AppError('PLease logout first!'), 400)
    }

    next()
}

export default loginAuth