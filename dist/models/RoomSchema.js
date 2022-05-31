"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const RoomSchema = new mongoose_1.Schema({
    id: String,
    name: {
        type: String,
        unique: true,
    },
    owner: String,
    users: [String],
    messages: {
        type: [{
                id: String,
                author: String,
                text: String,
                time: Date,
            }],
    },
}, { collection: 'room' });
exports.default = (0, mongoose_1.model)('RoomSchema', RoomSchema);
//# sourceMappingURL=RoomSchema.js.map