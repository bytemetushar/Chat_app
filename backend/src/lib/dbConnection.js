import mongoose from 'mongoose';

const connectDB = async ()=>{
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URL); 
        console.log(`Databse connection : ${conn.connection.host}`);
    } catch (error) {
        console.log("MongoDB connection Error :", error);
    }
}

export default connectDB;