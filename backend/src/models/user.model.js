import { Schema, model } from "mongoose";

const userSchema = new Schema({
    email:{
        type: String,
        required : true,
        unique : true
    },
    fullName : {
        type : String,
        required : true,
        trim : true
    },
    password : {
        type : String,
        required : true,
        minLength : [4, "Password should contains atleat 4 characters"],
    },
    profilePic :{
        type : String,
        default : "",
    }
},{
    timestamps : true
});

const User = model("users", userSchema);

export default User;