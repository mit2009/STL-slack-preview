const puppeteer = require("puppeteer");
const fs = require("fs");
const https = require("https");

const getAllButHostName = (url) => {
  const urlParts = url.split("/");
  urlParts.shift();
  urlParts.shift();
  urlParts.shift();
  return '/' + urlParts.join("/");
};

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time)
  });
}

const download = (url, dest) => {
  var file = fs.createWriteStream(dest);
  return new Promise((resolve, reject) => {
    let responseSent = false; // flag to make sure that response is sent only once.

    const options = {
      followRedirects: true,
      hostname: "files.slack.com",
      path: getAllButHostName(url),
      headers: {
        Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
      },
    };

    https.get(options, res => {
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          if (responseSent) return;
          responseSent = true;
          resolve();
        });
      });

    }).on('error', err => {
      if (responseSent) return;
      responseSent = true;
      reject(err);
    });
  });
}


const fileProcessor = async (slackApp, event) => {
  let submittedName = "name";
  try {
    const result = await slackApp.client.users.info({ user: event.user });
    submittedName = result.user.profile.real_name_normalized
      .split(" ")
      .join("_");
  } catch (error) {
    console.log("name error:", error);
  }
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
        const pageUrl = `${process.env.SCREENSHOT_URL}/?file=${publicFileName}`;
        const previewUrl = `${process.env.ROOT_URL}/?file=${publicFileName}`;
        const screenshotPath = `./public/screenshots/${submittedName}_${file.title.split(".stl")[0]
          }.png`;

        console.log("downloading...", event.files[i]);
        await download(event.files[i].url_private, fileName);
        console.log("downloaded!");


        // let browser = await puppeteer.launch({
        //   // args: ["--no-sandbox", "--disable-setuid-sandbox"],
        //   ignoreHTTPSErrors: true,
        // });
        const browser = await puppeteer.launch({
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
          ignoreHTTPSErrors: true,
          headless: true,
        })
        const page = await browser.newPage()
        let status;

        try {
          console.log("visiting ...", pageUrl);
          status = await page.goto(pageUrl, {
            waitUntil: "load",
            timeout: 20000,
          });
          // use a delay function as during HMR, waitUntil networkidle0 will never resolve
          await delay(8000);
          console.log(status);
          console.log('done visiting')
        } catch (err) {
          console.log("Error with going to page:", err);
        }

        await page.setViewport({ width: 700, height: 400, deviceScaleFactor: 2 });
        await page.screenshot({
          path: screenshotPath,
          type: "png",
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
  }
}

module.exports = fileProcessor;