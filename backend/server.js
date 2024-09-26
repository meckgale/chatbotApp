const dotenv = require("dotenv");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/db.js");
const { generateToken } = require("./utils/jwt");
const Session = require("./models/sessionModel");
const { default: mongoose } = require("mongoose");

const questions = require("./data/questions.js");
const authMiddleware = require("./middlewares/auth.js");

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.post("/api/start-session", async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }
  const session = new Session({
    sessionId: new mongoose.Types.ObjectId(),
    userId,
    startTime: Date.now(),
    questionsAndAnswers: questions.map((question) => ({
      question,
      answer: "",
    })),
  });

  await session.save();

  const token = generateToken(session.sessionId);

  return res.json({
    token,
    sessionId: session.sessionId,
    questions: session.questionsAndAnswers.map((qa) => qa.question),
  });
});

app.post("/api/submit-answer", authMiddleware, async (req, res) => {
  const { sessionId, question, answer } = req.body;

  if (!sessionId || !question || !answer) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Find the session by sessionId and update the question's answer
    const session = await Session.findOneAndUpdate(
      { sessionId, "questionsAndAnswers.question": question },
      { $set: { "questionsAndAnswers.$.answer": answer } }, // Update the answer for the specific question
      { new: true } // Return the updated session
    );

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Check if all questions have been answered
    const allAnswered = session.questionsAndAnswers.every(
      (qa) => qa.answer !== ""
    );

    // If all questions are answered, set the end time
    if (allAnswered) {
      session.endTime = Date.now();
      await session.save(); // Save the updated session with end time
    }

    res.json({ message: "Answer saved successfully", session });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save answer" });
  }
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is up and running on port ${PORT}`);
});
