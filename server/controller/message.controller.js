import Message from "../model/message.model.js";
import AppError from "../utils/error.utils.js";

const allMessage = async (req, res, next) => {
    try {
        const chat = await Message.find().populate('sender', 'fullName').sort('timestamp')
    } catch (e) {
        return next(new AppError(e, 500))
    }
}

const sendMessage = async (req, res, next) => {
    const { message, sender } = req.body
    try {
        let chat = new Message({
            message,
            sender
        })

        await chat.save()

        chat = await chat.populate('sender', 'message').execPopulate()

        res.status(200).json({
            message,
            success: true
        })

    } catch (e) {
        return next(new AppError(e.message, 500))
    }
}

export {
    allMessage,
    sendMessage
}
