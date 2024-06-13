const express = require("express");
const app = express();
const port = 3000;

app.get("/resource", (req, res) => {
  res.send("GET request to the resource");
});

app.post("/resource", (req, res) => {
  res.send("POST request to the resource");
});

app.put("/resource", (req, res) => {
  res.send("PUT request to the resource");
});

app.delete("/resource", (req, res) => {
  res.send("DELETE request to the resource");
});

app.listen(port, () => {
  console.log(`App listening at port ${port}`);
});
