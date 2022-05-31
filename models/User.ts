import { model, Schema } from 'mongoose';

type User = {
name: string
email: string
password: string
registered: Date
role: string
rooms: string[]
friends: string[]
}

const schema = new Schema<User>({
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

export default model('User', schema);
