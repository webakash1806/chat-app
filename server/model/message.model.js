import { model, Schema } from "mongoose";

const messageSchema = new Schema({
    message: {
        type: String
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
})

const Message = model('Message', messageSchema)

export default Message