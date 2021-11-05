const express = require("express");
const mongoose = require("mongoose");
const config = require("config");
const cors = require("cors");

const app = express();
app.use(cors());
const db = config.get("mongoURI");

const connectMongodb = async () => {
  try {
    await mongoose.connect(db);
    console.log("Connection established with db");
    app.listen(PORT, () => {
      console.log(`Server started at port ${PORT}`);
    });
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }
};

const PORT = process.env.port || 8000;

app.use(express.json({ extended: false }));

app.use("/api/auth", require("./routes/auth"));
// app.use("/api/profile", require("./routes/profile"));

app.get("/", (req, res) => {
  res.send("App running!");
});

connectMongodb();
