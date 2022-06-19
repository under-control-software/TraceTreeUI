//@ts-check

const express = require("express");
const cors = require("cors");
const path = require("path");
const { TraceTree } = require("./main/TraceTree");
require("dotenv").config();

const app = express();

app.get("/api/generategraph", cors(), async (req, res) => {
  await main();
  res.json({ response: "Done. Check terminal. Click Run to run again." });
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

const main = async () => {
  let ds = new TraceTree();
  await ds.run("getAccessControlAllowCredentials");
};

const port = process.env.PORT || 5000;

app.listen(port, () => `Server running on port ${port}`);
