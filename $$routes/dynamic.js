const express = require("express");
const app = express();
const port = 3000;

app.get("/user/:userId/books/:bookId", (req, res) => {
  const userId = req.params.userId;
  const bookId = req.params.bookId;

  res.send(`User ID: ${userId}, Book ID: ${bookId}`);
});

app.listen(port, () => {
  console.log(`App listening at port ${port}`);
});
