import { model , Schema } from "mongoose";
import User from "./user.model.js";

const messageSchema = new Schema({
    senderId :{
        type : Schema.Types.ObjectId,
        ref : User,
        required : true
    },
    recieverId : {
        type : Schema.Types.ObjectId,
        ref : User,
        required : true
    },
    text : {
        type : String
    },
    image : {
        type : String
    }
},{
    timestamps : true
});


const Message = model('messages', messageSchema);

export default Message;

