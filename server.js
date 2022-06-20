//@ts-check

const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const { TraceTree } = require("./main/TraceTree");
require("dotenv").config();

const app = express();

var jsonParser = bodyParser.json();
app.use(jsonParser);

app.post("/api/generategraph", cors(), async (req, res) => {
  const result = await main(req.body.name);
  res.json(result);
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

const main = async (funcName) => {
  let ds = new TraceTree();
  return await ds.run(funcName);
};

const port = process.env.PORT || 5000;

app.listen(port, () => `Server running on port ${port}`);
