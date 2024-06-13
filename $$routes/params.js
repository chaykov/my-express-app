const express = require("express");
const app = express();
const port = 3000;

app.get("/user/:id", (req, res) => {
  const userId = req.params.id;
  res.send(`User ID: ${userId}`);
});

app.listen(port, () => {
  console.log(`App listening at port ${port}`);
});
