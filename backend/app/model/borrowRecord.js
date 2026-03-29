/* eslint-disable */
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const BorrowRecordSchema = new Schema({
    bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    borrowDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    returnDate: { type: Date },
    status: { type: String, enum: ['borrowed', 'returned', 'overdue'], default: 'borrowed' },
  }, { timestamps: true });

  return mongoose.model('BorrowRecord', BorrowRecordSchema);
};
