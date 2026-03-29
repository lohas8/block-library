/* eslint-disable */
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const PointsItemSchema = new Schema({
    name: { type: String, required: true },
    points: { type: Number, required: true },
    description: { type: String },
    stock: { type: Number, default: -1 },  // -1 表示无限
    image: { type: String },
  }, { timestamps: true });

  return mongoose.model('PointsItem', PointsItemSchema);
};
