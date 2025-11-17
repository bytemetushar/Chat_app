import User from "../models/user.model.js";
import AppError from "../utils/error.util.js";
import bcrypt from 'bcryptjs'
import { generateToken } from "../utils/jwt.utils.js";
import cloudinary from "../lib/cloudinary.js";
import fs from 'fs'
import { io } from "../lib/socket.js";


export const signup = async (req , res , next)=>{
    
    try {
        const {fullName, email, password} = req.body;
        if(!fullName || !email || !password){
            return next(new AppError("All fields are required",400));
        }
        if(password.length < 4){
            return next(new AppError("password must contains atleast 4 characters",400));
        }

        const userExists = await User.findOne({email});

        if(userExists){
            return next(new AppError("User Already Exists", 400));
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password,salt);

        const user  = await User.create({
            fullName,
            email,
            password : hashPassword
        })

        if(user){
            generateToken(user._id,res);
            await user.save();

            res.status(200).json({
                success : true,
                message : `Registration successfully, Welcome ${user.fullName}`, 
                user
            })
        }else{
            return next(new AppError("User registration Failed, please try again",400));
        }
    } catch (error) {
        console.log('Signup Error:', error);
        return next(new AppError("Internal Server Error, registration failed", 500));
    }
}



export const login = async (req, res, next)=>{
    try {
        const {email , password} = req.body;

        if(!email || !password){
            return next(new AppError("All fields are required",400));
        }

        const user = await User.findOne({email});
        if(!user){
            return next(new AppError("user does not exists with this email",400));
        } 

        const isValid = await bcrypt.compare(password, user.password);
        if(!isValid){
            return next(new AppError("Invalid Credentials",400));
        }

        generateToken(user._id,res);

        res.status(200).json({
            status : true,
            message : `Welcome ${user.fullName}`,
            user
        })

    } catch (error) {
        console.log(error);
        return next(new AppError("Internal Server Error, Login failed", 500));
    }
}

export const logout = async (req , res, next)=>{
    try {
        res.cookie('jwt',null, {maxAge:0})
        res.status(200).json({
            success : true,
            message : "Logged out Successfully"
        })
    } catch (error) {
        return next(new AppError("Internal Server Error, Logout failed", 500));
    }
};

export const updateProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return next(new AppError("User not found!", 400));
        }

        const profilePic = req.body?.profilePic;

        // If frontend sends base64 image
        if (profilePic) {
            // upload base64 to Cloudinary
            const uploadResponse = await cloudinary.uploader.upload(profilePic, {
                folder: "Chat_app",
                width: 250,
                height: 250,
                gravity: "faces",
                crop: "fill" 
            });

            if (uploadResponse) {
                user.profilePic = uploadResponse.secure_url;
            }
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user
        });

        io.emit("profileUpdated", {
            userId: user._id,
            profilePic: user.profilePic
        });

    } catch (error) {
        console.error("Profile Update Error:", error);
        return next(
            new AppError("Internal Server Error, Profile Updation failed", 500)
        );
    }
};


export const checkAuth = async (req, res, next)=>{
    try {
        const user = await User.findById(req.user._id);
        if(!user){
            return next(new AppError("User not found!",400));
        }

        res.status(200).json({
            success : true,
            user
        });
    } catch (error) {
        return next(new AppError("Internal Server Error, Check Auth failed", 500));
    }
};