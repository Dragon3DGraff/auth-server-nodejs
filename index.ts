import express from 'express';
import config from 'config';
import path from 'path';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
// const winston = require('winston');
// const expressWinston = require('express-winston');
import cookieParser from 'cookie-parser';
import session from 'express-session';
// const { createClient } = require('redis')
// const connectRedis = require('connect-redis');
import bodyParser from 'body-parser';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
// import jwt from 'jsonwebtoken';
import RoomSchema from './models/RoomSchema';
import authRoutes from './routes/auth.routes';
import checkAuthRoutes from './routes/checkAuth.routes';
import roomsRouter from './routes/rooms.router';

import MessageSchema from './models/MessageSchema';

const app = express();
// const app = require("https-localhost")()
// var https = require('https');
// var fs = require('fs')

// const chatRooms = new Map();
// chatRooms.set('Комната', {
//   id: 1,
//   name: 'Комната',
//   users: [],
//   messages: [],
// });

// app.set('trust proxy', 2);
// const redisClient = createClient();
// const RedisStore = connectRedis(session)

// redisClient.on('error', (err) => console.log('Redis Client Error', err));
// redisClient.on('connect', function (err) {
//   console.log('Connected to redis successfully');
// });

// redisClient.connect();

app.use(
  cors({
    credentials: true,
    origin: ['http://localhost:5000'],
    optionsSuccessStatus: 200,
  }),
);

app.use(cookieParser());
// app.use(cookieParser("secretSign#143_!223"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.json());
// app.use(expressWinston.logger({
//   transports: [
//     new winston.transports.File({ filename: 'error.log', level: 'error' }),
//     new winston.transports.File({ filename: 'combined.log' }),
//   ],
//   format: winston.format.combine(
//     // winston.format.colorize(),
//     winston.format.json()
//   ),
//   meta: false,
//   msg: "HTTP ",
//   expressFormat: true,
//   colorize: false,
//   ignoreRoute: function (req, res) { return false; }
// }));

app.use(session({
  // store: new RedisStore({ host: 'localhost', port: 6379, client: redisClient }),
  secret: 'secret$%^134',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    secure: false, // if true only transmit cookie over https
    httpOnly: false, // if true prevent client side JS from reading the cookie
    maxAge: 1000 * 60 * 10, // session max age in miliseconds
  },
}));

app.use('/api/auth', authRoutes);
app.use('/api/checkAuth', checkAuthRoutes);
app.use('/api/rooms', roomsRouter);

// app.use(function(req, res, next) {
// res.header("Access-Control-Allow-Origin", "*");
// update to match the domain you will make the request from
// res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
// next();
//   });

const PORT = config.get('port') || 5000;

async function start() {
  try {
    await mongoose.connect(config.get('mongoURI'), {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      // useCreateIndex: true,
    });

    const server = app.listen(PORT, () => console.log(`Started at ${PORT}`));

    // let server = https.createServer({
    // key: fs.readFileSync('87221199_httpsmy-app.loca.lt.key'),
    // cert: fs.readFileSync('87221199_httpsmy-app.loca.lt.cert')
    //   }, app)
    //   .listen(PORT, function () {
    // console.log('Example app listening on port 3000! Go to https://localhost:3000/')
    //   })

    // let io = require("socket.io").listen(server);
    // let io = require("socket.io")(server, {
    //   allowEIO3: true, // false by default
    //   cors: {
    //     origin: "http://localhost:3000/",
    //     methods: ["GET", "POST"],
    //     credentials: true
    //   }
    // });
    const io = new Server(server, {
      // allowEIO3: true, // false by default
      cors: {
        origin: 'http://localhost:3000',
        // methods: ["GET", "POST"],
        credentials: true,
      },
    });

    app.get('/graphQlTest', (req, res) => {
      console.log('Сова, открывай! Медведь пришёл!');
      res.send('sds');
    });

    // preparing for production
    if (process.env.NODE_ENV === 'production') {
      app.use('/', express.static(path.join(__dirname, 'client', 'build')));

      app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
      });
    }

    io.on('connection', (socket) => {
      socket.on('room created', (nameOfRoom) => {
        io.emit('room created', nameOfRoom);
      });
    });

    // when user connected to room send him all users and messages
    io.on('connection', (socket) => {
      // TODO Проверка авторизации
      socket.on('user connected', async (roomId, authorId) => {
        const room = await RoomSchema.findOne({ id: roomId });
        const users = new Set(room.users);
        users.add(authorId);
        room.users = [...users];
        socket.join(roomId);
        io.sockets.to(roomId).emit('user connected', {
          users: room.users,
          messages: room.messages,
        });
        room.save();
        const messages = await MessageSchema.find({ roomId });
        io.sockets
          .to(roomId)
          .emit('chat message', messages);
      });
    });

    // get massages from room and sent them to all users of this room
    io.on('connection', (socket) => {
      // TODO Проверка авторизации
      socket.on('chat message', async (roomId, msg) => {
        socket.join(roomId);
        const message = new MessageSchema({
          id: uuidv4(), ...msg, time: new Date(msg.time).toISOString(), roomId,
        });
        await message.save();
        const messages = await MessageSchema.find({ roomId });
        io.sockets
          .to(roomId)
          .emit('chat message', messages);
      });
    });

    // webRTC - Video
    io.on('connection', (socket) => {
      socket.on('call-users', (data) => {
        socket.join(data.roomName);
        socket.to(data.roomName).emit('call-made', data);
      });

      socket.on('initiate call', (data) => {
        socket.join(data.roomName);
        socket.to(data.roomName).emit('call initiated', data);
      });

      socket.on('got description', (data) => {
        socket.join(data.roomName);
        socket.to(data.roomName).to(data.dest).emit('got description', data);
      });

      socket.on('iceCandidate', (data) => {
        socket.join(data.roomName);
        socket.to(data.roomName).emit('goticeCandidate', data);
      });
    });

    // when user close browser delete him from all rooms
    io.on('connection', (socket) => {
      socket.on('disconnect', () => {
        // delete user from all chats
        // chatRooms.forEach((room, roomName) => {
        //   room.users.map((user, index, array) => {
        //     if (user.id === socket.id) {
        //       array.splice(index, 1);
        //     }
        //     return null;
        //   });
        //   io.emit('user connected', {
        //     users: chatRooms.get(roomName).users,
        //     messages: chatRooms.get(roomName).messages,
        //   });
        // });
      });
    });
  } catch (e) {
    console.log('Server error', e.message);
    process.exit(1);
  }
}

start();

// lt --port 3000 --subdomain my-app --local-host localhost
