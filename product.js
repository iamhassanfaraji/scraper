const puppeteer = require("puppeteer-core")
const { join } = require("path")
const fs = require("fs/promises")

async function main() {

    const browser = await puppeteer.launch({
        executablePath: join(__dirname, '.cache/puppeteer/chrome/chrome-linux/chrome'),
        headless: true,
        defaultViewport: false
    })

    const page = await browser.newPage();
    await page.goto(url);
    await page.setViewport({ width: 1080, height: 1024 });
    await page.waitForSelector(activeMenuQuery);

}



main()