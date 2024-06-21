import { model, Schema } from "mongoose";
import bcrypt from 'bcryptjs'


const userSchema = new Schema({
    role: {
        type: String,
        enum: ['USER', 'ADMIN'],
        default: 'USER'
    },
    fullName: {
        type: String,
        trim: true,
        required: [true, "Name is required"],
        minLength: [3, "Name must be more than 2 characters"],
        maxLength: [30, "Name should not be more than 30 characters"]
    },
    email: {
        type: 'String',
        unique: true,
        required: [true, "Email is required"],
        match: [/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        select: false
    },
    confirmPassword: {
        type: String,
        select: false
    },
    avatar: {
        publicId: {
            type: String,
        },
        secure_url: {
            type: String,
        }
    },
    forgetPasswordToken: String,
    forgetPasswordExpiry: Date,

}, { timestamps: true })

userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.isModified('confirmPassword')) {
        return next()
    }

    this.password = await bcrypt.hash(this.password, 10)
    this.confirmPassword = await bcrypt.hash(this.confirmPassword, 10)
})

const User = model('User', userSchema)

export default User