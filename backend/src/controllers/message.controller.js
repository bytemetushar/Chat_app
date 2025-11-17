import cloudinary from "../lib/cloudinary.js";
import { getRecieverSocketId, io } from "../lib/socket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import AppError from "../utils/error.util.js";

export const getUsersforSidebar = async (req , res, next)=>{
    try {
        const loggedInUserId = req.user._id
        const filteredUsers = await User.find({_id : {$ne : loggedInUserId}}).select('-password');

        res.status(200).json({
            filteredUsers
        })
    } catch (error) {
        return next(new AppError('Internal Server Error',500));
    }
}


export const getMessages = async (req, res, next)=>{
    try {
        const {id : usertoChatId} = req.params;
        const myId = req.user._id;

        const message = await Message.find({
            $or : [
                {senderId:myId , recieverId:usertoChatId},
                {senderId:usertoChatId , recieverId:myId}
            ]
        }).sort({ createdAt: 1 });;

        res.status(200).json({
            message
        })
    } catch (error) {
        return next(new AppError('Get Message Internal Error',500));
    }
}


export const sendMessages = async (req, res, next)=>{
    try {
        const {text, image} = req.body;
        const{id: recieverId} = req.params;
        const senderId = req.user._id;

        let imageUrl;
        if(image){
            const  uploadResponse = await cloudinary.uploader.upload(image,{
                folder : "chat_app_image"
            })
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            recieverId,
            text,
            image : imageUrl
        })

        await newMessage.save();


        // realtime funtionality using socket.io---->
        const recieverSocketId = getRecieverSocketId(recieverId);
        if(recieverSocketId){
            io.to(recieverSocketId).emit("newMessage",newMessage)
        }

        res.status(201).json({newMessage})
    } catch (error) {
        console.log("Send message error:" , error)
        return next(new AppError("Send message interanl Error",500));
    }
}
