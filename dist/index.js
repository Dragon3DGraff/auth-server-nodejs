"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const config_1 = __importDefault(require("config"));
const path_1 = __importDefault(require("path"));
const socket_io_1 = require("socket.io");
const mongoose_1 = __importDefault(require("mongoose"));
// const winston = require('winston');
// const expressWinston = require('express-winston');
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_session_1 = __importDefault(require("express-session"));
// const { createClient } = require('redis')
// const connectRedis = require('connect-redis');
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const uuid_1 = require("uuid");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const RoomSchema_1 = __importDefault(require("./models/RoomSchema"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const checkAuth_routes_1 = __importDefault(require("./routes/checkAuth.routes"));
const User_1 = __importDefault(require("./models/User"));
const app = (0, express_1.default)();
// const app = require("https-localhost")()
// var https = require('https');
// var fs = require('fs')
const chatRooms = new Map();
chatRooms.set('Комната', {
    id: 1,
    name: 'Комната',
    users: [],
    messages: [],
});
// app.set('trust proxy', 2);
// const redisClient = createClient();
// const RedisStore = connectRedis(session)
// redisClient.on('error', (err) => console.log('Redis Client Error', err));
// redisClient.on('connect', function (err) {
//   console.log('Connected to redis successfully');
// });
// redisClient.connect();
app.use((0, cors_1.default)({
    credentials: true,
    origin: ['http://localhost:5000'],
    optionsSuccessStatus: 200,
}));
app.use((0, cookie_parser_1.default)());
// app.use(cookieParser("secretSign#143_!223"));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(express_1.default.json());
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
app.use((0, express_session_1.default)({
    // store: new RedisStore({ host: 'localhost', port: 6379, client: redisClient }),
    secret: 'secret$%^134',
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        secure: false,
        httpOnly: false,
        maxAge: 1000 * 60 * 10, // session max age in miliseconds
    },
}));
app.use('/api/auth', auth_routes_1.default);
app.use('/api/checkAuth', checkAuth_routes_1.default);
// app.use(function(req, res, next) {
// res.header("Access-Control-Allow-Origin", "*");
// update to match the domain you will make the request from
// res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
// next();
//   });
const PORT = config_1.default.get('port') || 5000;
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield mongoose_1.default.connect(config_1.default.get('mongoURI'), {
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
            const io = new socket_io_1.Server(server, {
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
            // get list of all rooms
            app.get('/rooms', (req, res) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.token;
                if (!token) {
                    return res.status(401).json({ message: 'No authorization' });
                }
                const decoded = jsonwebtoken_1.default.verify(token, config_1.default.get('jwtSecret'));
                if (!decoded.userId) {
                    res.clearCookie('token');
                    return res.status(400).json({ message: 'User not found' });
                }
                const { userId } = decoded;
                const user = yield User_1.default.findOne({ _id: userId });
                console.log(user);
                const roomsObj = { rooms: [...chatRooms.values()] };
                res.json(roomsObj);
            }));
            // preparing for production
            if (process.env.NODE_ENV === 'production') {
                app.use('/', express_1.default.static(path_1.default.join(__dirname, 'client', 'build')));
                app.get('*', (req, res) => {
                    res.sendFile(path_1.default.resolve(__dirname, 'client', 'build', 'index.html'));
                });
            }
            // Create new room
            app.post('/rooms', (req, res) => __awaiter(this, void 0, void 0, function* () {
                const { author, nameOfRoom } = req.body;
                const newRoom = new RoomSchema_1.default({
                    id: (0, uuid_1.v4)(), owner: author, name: nameOfRoom,
                });
                const room = yield newRoom.save();
                console.log('room created', room.id);
                const user = yield User_1.default.findOne({ _id: author });
                console.log('user', user);
                user.rooms.push(room.id);
                user.save();
                // old
                if (!chatRooms.has(nameOfRoom)) {
                    chatRooms.set(nameOfRoom, {
                        users: [],
                        messages: [],
                    });
                    res.send(`Room ${nameOfRoom} created`);
                }
                else {
                    res.status(409).send('Choose another name');
                }
            }));
            io.on('connection', (socket) => {
                socket.on('room created', (nameOfRoom) => {
                    io.emit('room created', nameOfRoom);
                });
            });
            // when user connected to room send him all users and messages
            io.on('connection', (socket) => {
                socket.on('user connected', (roomName, author) => {
                    chatRooms.get(roomName).users.push({ id: socket.id, name: author });
                    socket.join(roomName);
                    io.sockets.to(roomName).emit('user connected', {
                        users: chatRooms.get(roomName).users,
                        messages: chatRooms.get(roomName).messages,
                    });
                });
            });
            // get massages from room and sent them to all users of this room
            io.on('connection', (socket) => {
                socket.on('chat message', (roomName, msg) => {
                    socket.join(roomName);
                    chatRooms.get(roomName).messages.push(msg);
                    io.sockets
                        .to(roomName)
                        .emit('chat message', chatRooms.get(roomName).messages);
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
                    chatRooms.forEach((room, roomName) => {
                        room.users.map((user, index, array) => {
                            if (user.id === socket.id) {
                                array.splice(index, 1);
                            }
                            return null;
                        });
                        io.emit('user connected', {
                            users: chatRooms.get(roomName).users,
                            messages: chatRooms.get(roomName).messages,
                        });
                    });
                });
            });
        }
        catch (e) {
            console.log('Server error', e.message);
            process.exit(1);
        }
    });
}
start();
// lt --port 3000 --subdomain my-app --local-host localhost
//# sourceMappingURL=index.js.map