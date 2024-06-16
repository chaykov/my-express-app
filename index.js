const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const compression = require("compression");
const redis = require("redis");
const session = require("express-session");
const RedisStore = require("connect-redis").default;

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

// Connect to Redis
const redisClient = redis.createClient({ url: "redis://localhost:6379" });
redisClient.connect().catch(console.error);

// redisClient.on("error", (err) => {
//   console.log("Redis error:", err);
// });

// Middleware to parse JSON and compression
app.use(express.json());
app.use(compression());

// Configuration session
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: "6025bf2351553ac23aedbcfacdbb738db9197693b95cfd6958a34bf34f24fca6",
    resave: false,
    saveUninitialized: false,
  })
);

// Configuration Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

// Endpoint to upload files
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  res.status(200).send(`File uploaded successfully: ${req.file.filename}`);
});

// Serwowanie plików statycznych z katalogu 'public'
app.use(express.static("public"));

// Example in using Redis for cache
app.get("/data", (req, res) => {
  const key =
    "6025bf2351553ac23aedbcfacdbb738db9197693b95cfd6958a34bf34f24fca6";

  redisClient
    .get(key, (err, data) => {
      if (err) throw err;

      if (data !== null) {
        res.send(JSON.parse(data));
      } else {
        // Pobierz dane z bazy danych lub innego zrodla
        const newData = { some: "data" };

        redisClient.setEx(key, 3600, JSON.stringify(newData)); // cacheowanie na 1 godzinę
        res.send(newData);
      }
    })
    .catch((err) => {
      res.status(500).send(err.message);
    });
});

// Definition model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  roles: { type: [String], default: ["admin"] }, // Role user
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
  const token = jwt.sign({ userId: user._id, roles: user.roles }, JWT_SECRET, {
    expiresIn: "1h",
  });
  const refreshToken = jwt.sign(
    { userId: user._id, roles: user.roles },
    JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
  res.status(200).json({ token, refreshToken });
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

// Middleware to verify a role for user
const roleMiddleware = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.roles)) {
    return res.status(403).send("Access denied");
  }
  next();
};

// Example to protect route for '/protected'
app.get("/protected", authMiddleware, (req, res) => {
  res.send("This is a protected route");
});

// Example to protect routes with role
app.get("/admin", authMiddleware, roleMiddleware(["admin"]), (req, res) => {
  res.send("This is an admin route");
});

// Endpoint to refresh token for a user
app.post("/refresh-token", (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).send("Access denied");
  }

  try {
    const verified = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const newToken = jwt.sign(
      { userId: verified.userId, roles: verified.roles },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({ token: newToken });
  } catch (err) {
    res.status(400).send("Invalid refresh token");
  }
});

app.listen(port, () => {
  console.log(`App online ${port}`);
});

module.exports = app; // Eksportowanie aplikacji dla testów
