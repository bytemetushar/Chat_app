import jwt from "jsonwebtoken"
import User from "../models/user.model.js"
import AppError from "../utils/error.util.js"

export const isLoggedIn = async (req, res, next)=>{
    try {
        const token = req.cookies.jwt
        if(!token){
            return next(new AppError("Please login to access",401));
        }

        const userDetails = await jwt.verify(token ,process.env.JWT_SECRET);

        if(!userDetails){
            return next(new AppError("Unauthorized Access",401));
        }

        const user = await User.findById(userDetails.userId).select('-password');

        if(!user){
            return next(new AppError("User not found",404));
        }

        req.user = user;
        next();

    } catch (error) {
        return next(new AppError("Internal Server Error",500));       
    }
}