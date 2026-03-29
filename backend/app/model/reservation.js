/* eslint-disable */
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const ReservationSchema = new Schema({
    bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reserveDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'cancelled', 'completed'], default: 'pending' },
  }, { timestamps: true });

  return mongoose.model('Reservation', ReservationSchema);
};
