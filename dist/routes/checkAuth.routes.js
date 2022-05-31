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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const router = (0, express_1.Router)();
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log('checkAuth');
    try {
        // const sess = req.session;
        // console.log(sess);
        // if (sess && sess.username && sess.password) {
        //   if (sess.username) {
        //     console.log(sess.username);
        //     res.status(200).json({ userId, userName: sess.username });
        //   }
        // }
        // else {
        //   console.log("No authorization");
        //   return res.status(401).json({ message: "No authorization" });
        // }
        // return
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
        if (!user) {
            res.clearCookie('token');
            return res.status(400).json({ message: 'User not found' });
        }
        res.status(200).json({ userId, userName: user.name, role: user.role });
    }
    catch (error) {
        res.status(500).json({ message: 'ERROR' });
        console.log(error);
    }
    // req.cookies;
}));
exports.default = router;
//# sourceMappingURL=checkAuth.routes.js.map