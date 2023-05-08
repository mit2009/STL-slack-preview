const express = require("express");
const path = require("path");
const { App } = require('@slack/bolt');
const assetsRouter = require("./server/assets-router");
const bodyParser = require('body-parser');
const fileProcessor = require("./server/flie-processor");

const app = express();

require("dotenv").config();

const { PORT = 3001 } = process.env;

const slackApp = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
  port: PORT,
});

app.use(bodyParser.urlencoded())
app.use(bodyParser.json())


app.use("/", express.static(path.join(__dirname, "public")));
app.use("/src", assetsRouter);

app.get("/*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
})

app.post("/", (req, res) => {

  // Challenge Verification (do not remove)
  if (req.body.challenge) {
    res.json({ challenge: req.body.challenge });
  }

  if (!req.body.event.bot_id && req.body.event.user !== "U0565Q9NHUP") {
    console.log(req.body)
    if (req.body.event.files) {
      fileProcessor(slackApp, req.body.event);
    }
  }

  res.end();
});

app.listen(PORT, () => {
  console.log(`App running in port ${PORT}`);
});