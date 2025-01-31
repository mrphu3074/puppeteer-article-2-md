import express from "express";
import { scrapeLogic } from "./scrapeLogic.mjs";
const app = express();

const PORT = process.env.PORT || 4000;

app.get("/scrape", (req, res) => {
  scrapeLogic(req, res);
});

app.get("/", (req, res) => {
  res.send("Render Puppeteer server is up and running! v2");
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
