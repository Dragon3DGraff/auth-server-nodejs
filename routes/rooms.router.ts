import { Router } from 'express';
import config from 'config';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/User';
import RoomSchema from '../models/RoomSchema';

const router = Router();

// get list of all rooms
router.get('/all', async (req, res) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ message: 'No authorization' });
  }

  const decoded = jwt.verify(token, config.get('jwtSecret'));
  if (!decoded.userId) {
    res.clearCookie('token');
    return res.status(400).json({ message: 'User not found' });
  }
  const { userId } = decoded;

  const user = await User.findOne({ _id: userId });

  const rooms = await RoomSchema.find({
    id: {
      $in: user.rooms,
    },
  });

  res.json(rooms);
});

// Create new room
router.post('/create', async (req, res) => {
  const { author, nameOfRoom } = req.body;

  const roomExist = await RoomSchema.findOne({ name: nameOfRoom });

  if (roomExist) {
    return res.status(409).json({ message: 'Такая комната уже существует' });
  }

  const newRoom = new RoomSchema({
    id: uuidv4(), owner: author, name: nameOfRoom,
  });
  const room = await newRoom.save();

  const user = await User.findOne({ _id: author });
  const rooms = new Set(user.rooms);
  rooms.add(room.id);
  user.rooms = [...rooms];
  user.save();

  res.send(`Room ${nameOfRoom} created`);
});

// TODO rooms вынести из пользователя в отдельную таблицу
// TODO при переходе по ссылке добавить в комнату пользователя

export default router;
