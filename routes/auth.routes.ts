import { Router } from 'express';
import config from 'config';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { check, validationResult } from 'express-validator';
import User from '../models/User';

const router = Router();

router.post(
  '/register',
  [
    check('name', 'Enter name').exists(),
    check('email', 'Incorrect email').isEmail(),
    check('password', 'Min password length is 6 symbols').isLength({ min: 6 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(200).json({
          errors: errors.array(),
          message: 'Неверно заполнена форма',
        });
      }
      const { name, email, password } = req.body;
      const candidate = await User.findOne({ email });

      if (candidate) {
        return res.status(200).json({ errors: [{ param: 'email' }], message: 'Пользователь уже зарегистрирован' });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const user = new User({ name, email, password: hashedPassword });
      await user.save();
      res.status(201).json({ message: 'Account created!' });
    } catch (error) {
      res.status(500).json({ message: 'ERROR' });
    }
  },
);

router.post(
  '/login',
  [
    check('email', 'Incorrect email').normalizeEmail().isEmail(),
    check('password', 'Enter password').exists(),
  ],
  async (req, res) => {
    console.log('/login');
    // const { email, password } = req.body
    const sess = req.session;

    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: 'Incorrect registration data',
        });
      }
      const { email, password } = req.body;
      sess.email = email;
      sess.password = password;
      const user = await User.findOne({ email });
      // console.log(user)

      // req.session.key = req.body.email
      // if (!req.session.key) { req.session.key = req.sessionID }

      if (!user) {
        return res.status(400).json({ message: 'Не нашёл пользователя' });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ message: 'Wrong password' });
      }

      const token = jwt.sign({ userId: user.id }, config.get('jwtSecret'), {
        expiresIn: '1h',
      });

      res.clearCookie('token');
      res.cookie('token', token, { httpOnly: true });

      res.status(200).json({ id: user.id, name: user.name, role: user.role });
    } catch (error) {
      res.status(500).json({ message: 'ERROR' });
      console.log(error);
    }
  },
);

router.post('/logout', async (req, res) => {
  try {
    res.clearCookie('token');
    res.json({ userId: undefined, userName: undefined });
  } catch (error) {
    res.status(500).json({ message: 'ERROR' });
  }
});

export default router;
