const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`Connected to MongoDB database ${mongoose.connection.host}`);
  } catch (error) {
    console.log(`MongoDB database error ${error}`);
  }
};

module.exports = connectDB;
