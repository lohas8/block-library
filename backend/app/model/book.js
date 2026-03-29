/* eslint-disable */
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const BookSchema = new Schema({
    isbn: { type: String },
    title: { type: String, required: true },
    author: { type: String },
    publisher: { type: String },
    category: { type: String, default: '未分类' },
    cover: { type: String },
    description: { type: String },
    total: { type: Number, default: 1 },
    available: { type: Number, default: 1 },
    location: { type: String },
  }, { timestamps: true });

  return mongoose.model('Book', BookSchema);
};
