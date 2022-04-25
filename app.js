const { App } = require("@slack/bolt");
const path = require("path");
const puppeteer = require("puppeteer");

require("dotenv").config();

var https = require("https");
var fs = require("fs");

var download = async (url, dest) => {
  var file = fs.createWriteStream(dest);
  await https
    .get(
      url,
      {
        headers: {
          Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
        },
      },
      function (response) {
        response.pipe(file);
        file.on("finish", function () {
          file.close();
        });
      }
    )
    .on("error", function (err) {
      // Handle errors
      fs.unlink(dest); // Delete the file async. (But we don't check the result)
      console.log(err.message);
    });
};

// Initializes your app with your bot token and signing secret
const slackApp = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  // Socket Mode doesn't listen on a port, but in case you want your app to respond to OAuth,
  // you still need to listen on some port!
  port: 2999,
});

(async () => {
  // Start your app
  await slackApp.start(2999);
  console.log("⚡️ Bolt app is running!");
})();

slackApp.event("message", async ({ event, say }) => {
  const result = await slackApp.client.users.info({ user: event.user });
  const submittedName = result.user.profile.real_name_normalized
    .split(" ")
    .join("_");
  const fileList = [];

  let totalFiles = 0;
  if (event.files) {
    for (let i = 0; i < event.files.length; i++) {
      const file = event.files[i];

      if (
        file.name.split(".")[file.name.split(".").length - 1].toLowerCase() ===
        "stl"
      ) {
        totalFiles++;

        const publicFileName = `/uploads/${submittedName}_${file.title}`;
        const fileName = `./public${publicFileName}`;
        const pageUrl = `${process.env.SCREENSHOT_URL}/screenshot/?file=${publicFileName}`;
        const previewUrl = `${process.env.ROOT_URL}/?file=${publicFileName}`;
        const screenshotPath = `./screenshots/${submittedName}_${
          file.title.split(".stl")[i]
        }.jpg`;

        console.log(pageUrl);
        console.log("downloading...", fileName);
        await download(event.files[i].url_private_download, fileName);
        console.log("downloaded!");

        let browser = await puppeteer.launch({
          headless: false,
          args: ["--disable-setuid-sandbox"],
          ignoreHTTPSErrors: true,
        });
        let page = await browser.newPage();
        await page.goto(pageUrl, { waitUntil: "networkidle0", timeout: 5000 });
        await page.setViewport({ width: 500, height: 500 });
        await page.screenshot({
          path: screenshotPath,
          type: "jpeg",
          fullPage: true,
        });
        await page.close();
        await browser.close();

        let message = "";
        if (totalFiles == 1) {
          message = `Thanks for your submission! Here\'s a preview of *${file.title}*`;
        } else {
          message = `Here's file #${i + 1}: *${file.title}*`;
        }

        const result = await slackApp.client.files.upload({
          initial_comment: `${message}\n\nView the 3D file: <${encodeURI(
            previewUrl
          )}|${previewUrl}>`,
          thread_ts: event.ts,
          channels: event.channel,
          file: fs.createReadStream(screenshotPath),
        });
        fileList.push(result.file);
      }
    }

    if (totalFiles === 0) {
      slackApp.client.chat.postMessage({
        text: "Hello! Normally I would give you some STL previews, but I didn't see any *.stl* files :(",
        thread_ts: event.ts,
        channel: event.channel,
      });
    }
  }

  // console.log(fileList);

  // slackApp.client.chat.postMessage({
  //   text: "Hello there!",
  //   thread_ts: event.ts,
  //   channel: event.channel,
  //   files: fileList,
  // });
});

const express = require("express");
const app = express();
const port = process.env.PORT || 3001;

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/viewer.html"));
});

app.get("/screenshot", (req, res) => {
  res.sendFile(path.join(__dirname, "/screenshot.html"));
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
