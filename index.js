import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import authRouter from './routes/auth.route.js'
import userRouter from './routes/users.route.js';
import postRouter from './routes/posts.route.js';
import {createPost} from './controllers/posts.controller.js';

import User from './models/User.model.js';
import Post from './models/Post.model.js';
import {users, posts} from './data/index.js';

import {register} from './controllers/auth.controller.js';
import { verifyToken } from './middlewares/auth.middleware.js';

/* CONFIGURATIONS */
const  __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);
dotenv.config();
const app=express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({policy:"cross-origin"}));
app.use(morgan("common"));
app.use(bodyParser.json({limit:"30mb",extended:true}));
app.use(bodyParser.urlencoded({limit:"30mb",extended:true}));
app.use(cors());
app.use("/assets",express.static(path.join(__dirname,'public/assets')));

/* FILE STORAGE */
const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,"public/assets");
    },
    filename:(req,file,cb)=>{
        cb(null,file.originalname);
    }
});

const upload=multer({storage});

/* ROUTES WITH FILES */
app.post('/auth/register',upload.single("picture"),register);
app.post('/posts',verifyToken, upload.single("picture"),createPost)

/* ROUTES */
app.use('/auth',authRouter);
app.use('/users',userRouter);
app.use('/posts',postRouter)

/* MONGOOSE SETUP */
const PORT = process.env.PORT || 6001;
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on: http://localhost:${PORT}`));

    /* ADD DATA ONE TIME */
    // User.insertMany(users);
    // Post.insertMany(posts);
  })
  .catch((error) => console.log(`${error} did not connect`));
