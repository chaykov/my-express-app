const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const port = 3000;

// Secret for JWT
const JWT_SECRET =
  "201899a0530054be98883a4537c7170308c0785ea647ba4d77d0326f1d39684c";
const JWT_REFRESH_SECRET =
  "6025bf2351553ac23aedbcfacdbb738db9197693b95cfd6958a34bf34f24fca6";

// Connect to the mongoDB
mongoose.connect("mongodb://localhost:27017/mydatabase");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
  console.log("Connected to MongoDB successfully");
});

// Middleware to parse JSON
app.use(express.json());

// Definition model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const User = mongoose.model("User", userSchema);

// Register user
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  // Check if user exists
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.status(400).send("User already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create a new user
  const user = new User({ username: username, password: hashedPassword });
  await user.save();
  res.status(201).send("User registered");
});

// Login user
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // Find a user
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(400).send("Invalid username or password");
  }

  // Check a correct password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).send("Invalid username or password");
  }

  // Generation token JWT
  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" });
  res.status(200).json({ token });
});

// Middleware to verify token JWT
const authMiddleware = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(401).send("Access denied");
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).send("Invalid token");
  }
};

// Example to protect route for '/protected'
app.get("/protected", authMiddleware, (req, res) => {
  res.send("This is a protected route");
});

app.listen(port, () => {
  console.log(`App online ${port}`);
});