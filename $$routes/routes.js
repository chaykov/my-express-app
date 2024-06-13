const express = require("express");
const app = express();
const useRouter = express.Router();
const port = 3000;

useRouter.use((req, res, next) => {
  console.log("Time:", Date.now());
  next();
});

useRouter.get("/:id", (req, res) => {
  res.send(`User ID: ${req.params.id}`);
});

app.use("/users", useRouter);

app.listen(port, () => {
  console.log(`App listening at port ${port}`);
});
