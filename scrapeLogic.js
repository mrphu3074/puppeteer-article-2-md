const { extractFromHtml } = require("@extractus/article-extractor");
const puppeteer = require("puppeteer");
const TurndownService = require("turndown");
require("dotenv").config();

const scrapeLogic = async (req, res) => {
  let browser
  try {
    const url = req.query.url
    browser = await puppeteer.launch({
      args: [
        "--disable-setuid-sandbox",
        "--no-sandbox",
        "--single-process",
        "--no-zygote",
      ],
      executablePath:
        process.env.NODE_ENV === "production"
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : puppeteer.executablePath(),

    });
    const page = await browser.newPage();
    // Set screen size
    await page.setViewport({ width: 480, height: 960 });
    await page.goto(url, { waitUntil: 'networkidle2' });
    const turndown = new TurndownService()
    let html = await page.content()
    const article = await extractFromHtml(html)
    res.send({
      ...article,
      md: article.content ? turndown.turndown(article.content) : ""
    })
  } catch (e) {
    console.error(e);
    res.send(`Something went wrong while running Puppeteer: ${e}`);
  } finally {
    await browser.close();
  }
};

module.exports = { scrapeLogic };
