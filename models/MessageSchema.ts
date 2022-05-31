import { model, Schema } from 'mongoose';

const schema = new Schema({
  id: String,
  author: { id: String, name: String },
  text: String,
  time: Date,
  roomId: String,
}, { collection: 'messages' });

export default model('MessageSchema', schema);
