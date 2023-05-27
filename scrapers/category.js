const puppeteer = require("puppeteer-core")
const { join } = require("path")
const fs = require("fs/promises")

const activeMenuQuery = ".base-layout-desktop-header-navigation_BaseLayoutDesktopHeaderNavigation__navGroup__bGWtA"
const rightContainerQuery = ".BaseLayoutDesktopHeaderNavigationMainMegaMenu_BaseLayoutDesktopHeaderNavigationMainMegaMenu__mainCategoriesSection__QDkXq"
const activeMenuListQuery = ".BaseLayoutDesktopHeaderNavigationMainMegaMenu_BaseLayoutDesktopHeaderNavigationMainMegaMenu__categoriesContentSection__iuiq7 .d-flex.BaseLayoutDesktopHeaderNavigationMainMegaMenu_BaseLayoutDesktopHeaderNavigationMainMegaMenu__categoriesContentSectionItem__2MmGM"

const url = "https://www.digikala.com/"

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

    const menuNodeObject = await page.$(activeMenuQuery)
    await menuNodeObject.hover()

    const activeCategoryListDom = await page.$(`${rightContainerQuery} a:nth-of-type(2)`)
    await activeCategoryListDom.hover()
    
    
    const menuListsDom = await page.$$(`${activeMenuListQuery} ul a`)
    const categories = []

    for (let menuListDom of menuListsDom) {
        const classes = Object.values(await menuListDom.evaluate((el) => el.classList, menuListDom))

        if (classes.find((value) => value == "text-body1-strong")) {

            categories.push({
                firstLevel: {
                    value: await page.evaluate((el) => el.textContent, menuListDom),
                    href: await page.evaluate((el) => el.href, menuListDom),
                    readStatus: false
                },
                lastLevel: []
            })
            
        } else if (classes.find((value) => value == "text-body-2")) {

            const getLastObject = categories.length - 1
            const valueCategory = await page.evaluate((el) => el.textContent, menuListDom)
            const href = await page.evaluate((el) => el.href, menuListDom)

            if(categories[getLastObject].readStatus){
                delete categories[getLastObject].readStatus
            }

            categories[getLastObject].lastLevel.push({
                value: valueCategory,
                href: href,
                readStatus: false
            })

        } else {
            console.error("pattern changed please update")
        }   
    }

    await fs.writeFile("./result/categories.json", JSON.stringify(categories), "utf-8")
}


main()

