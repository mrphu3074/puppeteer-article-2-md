import './config.mjs'
import { extractFromHtml } from "@extractus/article-extractor";
import puppeteer from "puppeteer";
import TurndownService from "turndown";

const turndown = new TurndownService()
const sleep = (duration) => new Promise(done => setTimeout(done, duration))

export const scrapeLogic = async (req, res) => {
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
    await page.setViewport({ width: 480, height: 960 });
    await page.goto(url, { waitUntil: 'networkidle2' });

    let article;
    for (let i = 0; i < 3; i++) {
      if (!page) continue
      let html = await page.content()
      article = await extractFromHtml(html)
      if (article && article.content) {
        break
      }
      await sleep(500)
    }

    res.send({
      ...(article || {}),
      md: article ? turndown.turndown(article.content) : ""
    })
  } catch (e) {
    console.error(e);
    res.send(`Something went wrong while running Puppeteer: ${e}`);
  } finally {
    await browser.close();
  }
};
