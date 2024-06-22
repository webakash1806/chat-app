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

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return next(new AppError("Email and password is required", 400))
        }

        const user = await User.findOne({ email }).select('+password')

        if (!user) {
            return next(new AppError("Email is not registered", 400))
        }

        const passwordCheck = await user.comparePassword(password)
        if (!passwordCheck) {
            return next(new AppError("Password is wrong", 400))
        }

        const token = await user.generateJWTToken()
        res.cookie('token', token, cookieOption)

        res.status(200).json({
            success: true,
            message: "Login successful",
            user
        })

    } catch (e) {
        return next(new AppError(e.message, 500))
    }
}

const logout = async (req, res, next) => {
    try {
        const token = ""
        const cookieOption = {
            logoutAt: new Date(),
            httpOnly: true,
            secure: true,
            sameSite: 'None'
        }
        res.cookie("token", token, cookieOption)
        res.status(200).json({
            success: true,
            message: "Logout successful",
        })
    }
    catch (e) {
        return next(new AppError(e.message, 500))
    }
}

const profile = async (req, res, next) => {
    try {
        const userId = req.user.id

        const user = await User.findById(userId)

        res.status(200).json({
            success: true,
            message: "User details",
            user
        })

    }
    catch (e) {
        return next(new AppError(e.message, 500))
    }
}

const updateProfile = async (req, res, next) => {
    try {
        const { fullName } = req.body
        const { id } = req.user

        const user = await User.findById(id)

        if (!user) {
            return next(new AppError("User does not exist", 400))
        }

        if (fullName) {
            user.fullName = await fullName
        }

        if (req.file) {
            // Destroying the previous avatar in cloudinary
            await cloudinary.v2.uploader.destroy(user.avatar.publicId)
            try {
                // Uploading the new avatar to cloudinary
                const result = await cloudinary.v2.uploader.upload(req.file.path, {
                    folder: 'lms',
                    width: 250,
                    height: 250,
                    gravity: 'faces',
                    crop: 'fill',
                })
                // Updating user's avatar information
                if (result) {
                    user.avatar.publicId = result.public_id
                    user.avatar.secure_url = result.secure_url

                    // Removing the temporary file after avatar upload
                    fs.rm(`uploads/${req.file.filename}`)
                }
            }
            catch (err) {
                // Handling errors during avatar upload
                return next(new AppError('File can not get uploaded', 500))
            }
        }

        // Saving the updated user document
        await user.save()

        // Sending success response to the client
        res.status(200).json({
            success: true,
            message: 'User Detail updated successfully'
        })
    }

    catch (e) {
        return next(new AppError(e.message, 500))
    }
}

export {
    register,
    login,
    logout,
    profile,
    updateProfile
}