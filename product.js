const puppeteer = require("puppeteer-core")
const { join } = require("path")
const fs = require("fs")


async function readProduct(url) {
    const product = {}
    const browser = await puppeteer.launch({
        executablePath: join(__dirname, '.cache/puppeteer/chrome/chrome-linux/chrome'),
        headless: true,
        defaultViewport: false
    })

    const page = await browser.newPage();
    await page.goto(url);
    await page.setViewport({ width: 1080, height: 1024 });
    await page.waitForSelector();
    await page.close()
    return product
}



fs.readFile(join(__dirname, "result/category.json"), { encoding: "utf-8" }, async (err, data) => {
    if (err) {
        console.log("have error when read file")
        console.log(err)
    } else {

        const categories = JSON.parse(data)
        const products = {}
        
        for (let firstLevel in categories) {
            if (categories[firstLevel].level3.length > 0) {

                for (let category of categories[firstLevel].level3) {

                }

            } else {

            }
        }

        fs.writeFileSync(join(__dirname, "result/products.json"), JSON.stringify(products))
    }
})