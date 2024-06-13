const express = require("express");
const app = express();
const mainRouter = express.Router();
const subRouter = express.Router();
const port = 3000;

subRouter.get("/info", (req, res) => {
  res.send("Info sub-route");
});

mainRouter.use("/sub", subRouter);

mainRouter.get("/main", (req, res) => {
  res.send("Main route");
});

app.use("/api", mainRouter);
app.use("/api", subRouter);

app.listen(port, () => {
  console.log(`App listening at port ${port}`);
});
