"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    id: String,
    autor: String,
    text: String,
    time: Date,
});
exports.default = (0, mongoose_1.model)('MessageSchema', schema);
//# sourceMappingURL=MessageSchema.js.map