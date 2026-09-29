const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, trim: true, maxlength: 60, default: '' },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    avatarFilename: { type: String, default: null },
  },
  { timestamps: true }
);

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    ret.avatarUrl = ret.avatarFilename ? `/api/users/${ret.id}/avatar/file` : null;
    delete ret.avatarFilename;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
