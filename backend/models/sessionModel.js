const mongoose = require("mongoose");
const { Schema } = mongoose;

const answerSchema = new Schema({
  question: { type: String, required: true },
  answer: { type: String, required: false }, // returned to false for test purpose
});

const sessionSchema = new Schema({
  sessionId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  questionsAndAnswers: [answerSchema],
});

const Session = mongoose.model("Session", sessionSchema);

module.exports = Session;
