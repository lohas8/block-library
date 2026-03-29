/* eslint-disable */
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const crypto = require('crypto');

  const UserSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String },
    email: { type: String },
    points: { type: Number, default: 0 },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  }, { timestamps: true });

  // 密码加密
  UserSchema.methods.comparePassword = function(password) {
    const md5 = crypto.createHash('md5');
    return md5.update(password).digest('hex') === this.password;
  };

  // 密码保存前加密
  UserSchema.pre('save', function(next) {
    if (this.isModified('password')) {
      const md5 = crypto.createHash('md5');
      this.password = md5.update(this.password).digest('hex');
    }
    next();
  });

  return mongoose.model('User', UserSchema);
};
