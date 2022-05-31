"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    registered: { type: Date, default: Date.now },
    role: { type: String },
    rooms: [String],
    friends: [String],
});
exports.default = (0, mongoose_1.model)('User', schema);
//# sourceMappingURL=User.js.map