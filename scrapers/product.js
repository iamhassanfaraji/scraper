const puppeteer = require("puppeteer-core")
const { join } = require("path")
const fs = require("fs")
const queryAsync = require("./importData/db")
const { inspect } = require("util")


const waitForProduct = ".styles_PdpProductContent__sectionBorder--mobile__J7liJ"
const name = "h1.text-h4.color-900.mb-2.disable-events"
const images = ".swiper-wrapper .swiper-slide img"
const price = ".styles_BuyBoxFooter__actionWrapper__Hl4e7 span.color-800"
const description = "article.styles_PdpProductContent__sectionBorder__39zAX div.text-body-1.color-800"
const openSpecs = "section#specification span.text-button-2"
const specsInModal = "#modal-root div.styles_SpecificationBox__main__JKiKI .styles_SpecificationAttribute__valuesBox__gvZeQ"
const specs = "selection#specification div.styles_SpecificationAttribute__valuesBox__gvZeQ"
const colors = "div.d-flex.flex-wrap-lg.overflow-x-auto .styles_InfoSectionVariationColor__pX_3M .styles_InfoSectionVariationColorContent__main__OUcdN"

async function readProduct(url, browser) {

    const product = {
        images: [],
        colors: []
    }

    const page = await browser.newPage();
    await page.goto(url);
    await page.setViewport({ width: 680, height: 812 });
    await page.waitForSelector(waitForProduct);

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
    const contentName = await page.evaluate((el) => el.innerText, nameDom)
    product["name"] = contentName

    const priceDom = await page.$(price)
    const contentPrice = await page.evaluate((el) => el.innerText, priceDom)
    product["price"] = contentPrice

    const descriptionDom = await page.$(description)
    if (descriptionDom) {
        const contentDescription = await page.evaluate((el) => el.innerText, descriptionDom)
        product["description"] = contentDescription
    }

    const openSpecsDom = await page.$(openSpecs)
    let specsDom
    product["specs"] = {}

    if (openSpecsDom) { //some product dont have log specs 
        await openSpecsDom.click()
        specsDom = await page.$$(specsInModal)
    }else{
        specsDom = await page.$$(specs)
    }

    for (let specDom of specsDom) {
        const specField = await page.evaluate((el) => el.querySelector(".styles_SpecificationAttribute__value__CQ4Rz").innerText, specDom)
        const specsValue = await page.evaluate((el) => el.querySelector("p.d-flex.ai-center.w-full.text-body-1.color-900.break-words").innerText, specDom)
        product["specs"][specField] = specsValue
    }
    console.log(`product ${contentName} readied`)
    await page.close()
    return product
}


const productListQuery = ".product-list_ProductList__item__LiiNI"
const adsQuery = ".product-list_ProductList__item__LiiNI article div.ai-center div.ai-center.text-caption span"

async function selectPartOfProducts(url, browser, productLimitation) {
    const page = await browser.newPage()

    // my resource is digikala.com site,
    // these site in some categories, before show product list 
    // load home page of category should skip these page and access product list so add ' product-list' end of url
    // and for remove not available add ' ?has_selling_stock=1 ' query

    await page.goto(`${url}/product-list/?has_selling_stock=1`)
    await page.setViewport({ width: 1800, height: 1024 });
    await page.waitForSelector(productListQuery)

    const productListDom = await page.$$(productListQuery)
    let productLimit = productLimitation

    const urlsOfProduct = []

    for (let product of productListDom) {
        const checkAdsQuery = await product.$(adsQuery)
        if (checkAdsQuery) {
            console.log("a product skipped, is ads")
            continue;
        } else if (productLimit == 0) {
            break;
        }

        productLimit -= 1
        const href = await product.evaluate((el) => el.querySelector("a").href, product)
        urlsOfProduct.push(href)
    }
    await page.close()
    return urlsOfProduct
}

const productLimitation = 3


async function reader(category, browser) {
    const idCategory = await queryAsync("SELECT id FROM product_categories WHERE name=?", [category.value])
    const productListUrls = await selectPartOfProducts(category.href, browser, productLimitation)

    for (let productUrl of productListUrls) {
        const productDetails = await readProduct(productUrl, browser)
        const products = JSON.parse(fs.readFileSync(join(__dirname, "result/products.json"), { encoding: "utf-8" }))
        products.push({
            category_id: idCategory[0].id,
            ...productDetails
        })
        fs.writeFileSync(join(__dirname, "result/products.json"), JSON.stringify(products), { encoding: "utf-8" })
    }

    console.log(`category ${category.value} read`)
}


function thisCategoryRead(type, where) {
    const categories = JSON.parse(fs.readFileSync(join(__dirname, "result/category.json"), { encoding: "utf-8" }))

    switch (type) {
        case 'firstLevel':
            categories[where].firstLevel["readStatus"] = true
            break;
        case 'lastLevel':
            categories[where[0]].lastLevel[where[1]]["readStatus"] = true
            break;
    }

    fs.writeFileSync(join(__dirname, "result/category.json"), JSON.stringify(categories), { encoding: "utf-8" })
}


fs.readFile(join(__dirname, "result/category.json"), { encoding: "utf-8" }, async (err, data) => {
    if (err) {

        console.log("have error when read file")
        console.log(err)

    } else {

        const browser = await puppeteer.launch({
            executablePath: join(__dirname, '.cache/puppeteer/chrome/chrome-linux/chrome'),
            headless: false,
            defaultViewport: false
        })

        const categories = JSON.parse(data)

        for (let i = 0; i < categories.length; i++) {
            if (categories[i].lastLevel.length > 0) {
                for (let j = 0; j < categories[i].lastLevel.length; j++) {
                    if (!categories[i].lastLevel[j].readStatus) {
                        await reader(categories[i].lastLevel[j], browser)
                        thisCategoryRead('lastLevel', [i, j])
                    } else {
                        console.log(`skipped category ${categories[i].lastLevel[j].value}`)
                    }
                }
            } else {
                if (!categories[i].firstLevel.readStatus) {
                    await reader(categories[i].firstLevel, browser)
                    thisCategoryRead('firstLevel', i)
                } else {
                    console.log(`skipped category ${categories[i].firstLevel.value}`)
                }
            }
        }
    }
})