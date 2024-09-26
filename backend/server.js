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

  return res.json({ token, sessionId: session.sessionId, questions });
});

app.use("/api/protected-route", authMiddleware, (req, res) => {
  return res.json({ message: "Access granted", sessionId: req.sessionId });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is up and running on port ${PORT}`);
});
