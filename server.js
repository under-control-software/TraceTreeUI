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

// @ts-ignore
app.post("/api/generategraph", cors(), async (req, res) => {
  const result = await main(req.body.name, 0);
  res.json(result);
});

// @ts-ignore
app.post("/api/expandgraph", cors(), async (req, res) => {
  const result = await expand(req.body.name, 0, {});
  res.json(result);
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

const main = async (funcName, paramCount) => {
  let ds = new TraceTree();
  return await ds.run(funcName, paramCount);
};

const expand = async (funcName, paramCount, funcObj) => {
  let ds = new TraceTree();
  return await ds.expand(funcName, paramCount, funcObj);
};

const port = process.env.PORT || 5000;

app.listen(port, () => `Server running on port ${port}`);
