import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import messageRoutes from './routes/message.routes.js'
import connectDB from './lib/dbConnection.js';
import cookieParser from 'cookie-parser'
import cors from 'cors';
import {app, server} from './lib/socket.js';
import path from "path";
import { fileURLToPath } from "url"


dotenv.config();
const PORT = process.env.PORT;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({
    origin : 'http://localhost:5173',
    credentials : true
}))

app.use(cookieParser());

app.use(express.json({limit : '10mb'}));
app.use(express.urlencoded({extended: true}));

app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);


if (process.env.NODE_ENV === "production") {
    const distPath = path.join(__dirname, "../frontend/dist");

    app.use(express.static(distPath));

    app.get("/*", (req, res, next) => {
        if (req.path.startsWith("/api")) return next();
        res.sendFile(path.join(distPath, "index.html"));
    });
}


server.listen(PORT,()=>{
    console.log(`Server is listening at port : ${PORT}`);
    connectDB();
})
