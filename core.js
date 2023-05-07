const puppeteer = require("puppeteer-core")
const { join } = require("path")
const jsDom = require("jsdom")
const { JSDOM } = jsDom

function crawlersRunner(url, waitFor, headless) {
    const crawlers = []
    async function startCrawler() {
        const browser = await puppeteer.launch({
            executablePath: join(__dirname, '.cache/puppeteer/chrome/chrome-linux/chrome'),
            headless: headless,
            defaultViewport: false
        })

        const page = await browser.newPage();
        await page.goto(url);
        await page.setViewport({ width: 1080, height: 1024 });
        await page.waitForSelector(waitFor);
        const readDataAppendPage = readData(page)

        crawlers.forEach( async (crawler) => {
            await crawler(page, readDataAppendPage)
        })

        await browser.close()
    }

    function addCrawler(crawler) {
        crawlers.push(crawler)
    }

    function readData(page){
        return async (parentQuery, itemsQuery)=>{
            const element = await page.$(parentQuery)
            const domElement = await page.evaluate((el) => el.innerHTML, element)
            
            const { document } = new JSDOM(domElement).window
            const result = document.querySelectorAll(itemsQuery).map(item => {
                return item.innerHTML
            });


            return result.length == 1 ? result[0] : result
        }
    }

    return [startCrawler, addCrawler]
}

module.exports = crawlersRunner