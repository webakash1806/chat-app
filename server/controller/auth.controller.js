import User from "../model/auth.model.js";
import AppError from '../utils/error.utils.js'
import cloudinary from 'cloudinary'
const cookieOption = {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: true,
    sameSite: 'None'
}

const register = async (req, res, next) => {
    try {
        const { fullName, email, password, confirmPassword } = req.body

        if (!email || !fullName || !password || !confirmPassword) {
            return next(new AppError("All fields are required", 400))
        }

        const uniqueEmail = await User.findOne({ email })
        if (uniqueEmail) {
            return next(new AppError("Email is already registered", 400))
        }

        const user = await User.create({
            fullName,
            email,
            password,
            confirmPassword,
            avatar: {
                publicId: "",
                secure_url: ""
            }
        })

        if (!user) {
            return next(new AppError("Try again! Failed to register", 400))
        }

        if (req.file) {
            try {
                // Uploading the file to cloudinary
                const result = await cloudinary.v2.uploader.upload(req.file.path, {
                    folder: 'lms',
                    width: 250,
                    height: 250,
                    gravity: 'faces',
                    crop: 'fill',
                })
                // Updating user avatar information
                if (result) {
                    user.avatar.publicId = result.public_id
                    user.avatar.secure_url = result.secure_url
                    // Removing the temporary file after upload
                    fs.rm(`uploads/${req.file.filename}`)
                }
            }
            catch (err) {
                return next(new AppError('File can not get uploaded', 500))
            }
        }

        const token = await user.generateJWTToken()
        res.cookie('token', token, cookieOption)

        if (password === confirmPassword) {
            await user.save()
            user.password = undefined
            user.confirmPassword = undefined
            res.status(201).json({
                success: true,
                message: "User registered successfully",
                user
            })
        } else {
            return next(new AppError("Password and confirm password must be same", 400))
        }

    } catch (e) {
        return next(new AppError(err.message, 500))
    }
}

export {
    register
}