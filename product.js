const puppeteer = require("puppeteer-core")
const { join } = require("path")
const fs = require("fs")
const queryAsync = require("./importData/db")

const waitForProduct = ".styles_PdpProductContent__sectionBorder--mobile__J7liJ"
const notProductAvailable = ".notAvailable_BuyBoxNotAvailable__headerTextLine__OYL9b"

const name = "h1.text-h4.color-900.mb-2.disable-events"
const images = ".swiper-wrapper .swiper-slide img"
const price = ".available_InfoSectionBuyboxAvailable__main__IyGCL span.color-800"
const description = "article.styles_PdpProductContent__sectionBorder__39zAX div.text-body-1.color-800"
const openSpecs = "section#specification span.text-button-2"
const specs = "#modal-root div.styles_SpecificationBox__main__JKiKI .styles_SpecificationAttribute__valuesBox__gvZeQ"
const colors = "div.d-flex.flex-wrap-lg.overflow-x-auto .styles_InfoSectionVariationColor__pX_3M .styles_InfoSectionVariationColorContent__main__OUcdN"


const browser = await puppeteer.launch({
    executablePath: join(__dirname, '.cache/puppeteer/chrome/chrome-linux/chrome'),
    headless: true,
    defaultViewport: false
})

async function readProduct(url) {

    const product = {
        images: [],
        colors: []
    }

    const page = await browser.newPage();
    await page.goto(url);
    await page.setViewport({ width: 680, height: 812 });
    await page.waitForSelector(waitForProduct);


    const notAvailableCheckDom = await page.$(notProductAvailable)
    if(Boolean(notAvailableCheckDom)){
        console.log(`this ${url} is not available`)
        return;
    }


    const imagesDom = await page.$$(images)
    for (let imgDom of imagesDom) {
        const res = await page.evaluate((el) => {
            return el.getAttribute("src")
        }, imgDom)
        product.images.push(res)
    }

    const colorsDom = await page.$$(colors)
    for (let colorDom of colorsDom) {
        const res = await page.evaluate((el) => {
            const rgb2hex = (rgb) => `#${rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/).slice(1).map(n => parseInt(n, 10).toString(16).padStart(2, '0')).join('')}`
            return rgb2hex(window.getComputedStyle(el).getPropertyValue("background-color"))
        }, colorDom)
        product.colors.push(res)
    }

    const nameDom = await page.$(name)
    const contentName = await page.evaluate((el) => el.textContent, nameDom)
    product["name"] = contentName

    const priceDom = await page.$(price)
    const contentPrice = await page.evaluate((el) => el.textContent, priceDom)
    product["price"] = contentPrice


    const descriptionDom = await page.$(description)
    if(descriptionDom){
        const contentDescription = await page.evaluate((el) => el.textContent, descriptionDom)
        product["description"] = contentDescription
    }


    const openSpecsDom = await page.$(openSpecs)
    await openSpecsDom.click()
    const specsDom = await page.$$(specs)
    product["specs"] = {}

    for (let specDom of specsDom) {
        const specField = await page.evaluate((el) => el.querySelector(".styles_SpecificationAttribute__value__CQ4Rz").textContent, specDom)
        const specsValue = await page.evaluate((el) => el.querySelector("p.d-flex.ai-center.w-full.text-body-1.color-900.break-words").textContent, specDom)
        product["specs"][specField] = specsValue
    }

    await page.close()

    return product
}

fs.readFile(join(__dirname, "result/category.json"), { encoding: "utf-8" }, async (err, data) => {

    if (err) {

        console.log("have error when read file")
        console.log(err)

    } else {

        const categories = JSON.parse(data)
        const products = []

        for (let category of categories) {

            if (category.lastLevel.length > 0) {

                for (let item of category.lastLevel) {
                    const idCategory =( await queryAsync("SELECT id FROM product_categories WHERE name=", [item.value]) )[0].id
                    const product_values = await readProduct(item.href)

                    const product = {
                        category_id: idCategory,
                        ...product_values
                    }
                    products.push(product)
                }
            } else {

            }
        }

        fs.writeFileSync(join(__dirname, "result/products.json"), JSON.stringify(products))
    }
})