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
const express_1 = require("express");
const config_1 = __importDefault(require("config"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const User_1 = __importDefault(require("../models/User"));
const router = (0, express_1.Router)();
router.post('/register', [
    (0, express_validator_1.check)('name', 'Enter name').exists(),
    (0, express_validator_1.check)('email', 'Incorrect email').isEmail(),
    (0, express_validator_1.check)('password', 'Min password length is 6 symbols').isLength({ min: 6 }),
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(200).json({
                errors: errors.array(),
                message: 'Неверно заполнена форма',
            });
        }
        const { name, email, password } = req.body;
        const candidate = yield User_1.default.findOne({ email });
        if (candidate) {
            return res.status(200).json({ errors: [{ param: 'email' }], message: 'Пользователь уже зарегистрирован' });
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 12);
        const user = new User_1.default({ name, email, password: hashedPassword });
        yield user.save();
        res.status(201).json({ message: 'Account created!' });
    }
    catch (error) {
        res.status(500).json({ message: 'ERROR' });
    }
}));
router.post('/login', [
    (0, express_validator_1.check)('email', 'Incorrect email').normalizeEmail().isEmail(),
    (0, express_validator_1.check)('password', 'Enter password').exists(),
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('/login');
    // const { email, password } = req.body
    const sess = req.session;
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
                message: 'Incorrect registration data',
            });
        }
        const { email, password } = req.body;
        sess.email = email;
        sess.password = password;
        const user = yield User_1.default.findOne({ email });
        // console.log(user)
        // req.session.key = req.body.email
        // if (!req.session.key) { req.session.key = req.sessionID }
        if (!user) {
            return res.status(400).json({ message: 'rНеv нашёл пользователя' });
        }
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Wrong password' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, config_1.default.get('jwtSecret'), {
            expiresIn: '1h',
        });
        res.clearCookie('token');
        res.cookie('token', token, { httpOnly: true });
        res.status(200).json({ id: user.id, name: user.name, role: user.role });
    }
    catch (error) {
        res.status(500).json({ message: 'ERROR' });
        console.log(error);
    }
}));
router.post('/logout', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.clearCookie('token');
        res.json({ userId: undefined, userName: undefined });
    }
    catch (error) {
        res.status(500).json({ message: 'ERROR' });
    }
}));
exports.default = router;
//# sourceMappingURL=auth.routes.js.map