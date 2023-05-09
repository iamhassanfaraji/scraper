const puppeteer = require("puppeteer-core")
const { join } = require("path")
const fs = require("fs/promises")
const {inspect} = require("util")

const activeMenuQuery = ".base-layout-desktop-header-navigation_BaseLayoutDesktopHeaderNavigation__navGroup__bGWtA"
const parentContainerQuery = ".base-layout-desktop-header-navigation_BaseLayoutDesktopHeaderNavigation__megaMenuContainer__ipIFg"
const rightContainerQuery = ".BaseLayoutDesktopHeaderNavigationMainMegaMenu_BaseLayoutDesktopHeaderNavigationMainMegaMenu__mainCategoriesSection__QDkXq" // equal to level 1 parent Category container
const activeMenuListQuery = ".d-flex .BaseLayoutDesktopHeaderNavigationMainMegaMenu_BaseLayoutDesktopHeaderNavigationMainMegaMenu__categoriesContentSectionItem__2MmGM"
const subParentQuery = "."
const lastChildQuery = "."
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
    const menuValues = await page.$(activeMenuQuery)

    const level1Categories = await page.$$(`${rightContainerQuery} a`)

    for (let item of level1Categories) {
        const nameFirstLevelCategory = await page.evaluate((el) => el.querySelector("p").textContent, item)
        await item.hover()

        const menuListsDom = await page.$$(`${activeMenuListQuery} ul a`)

        const subCategories = []

        for (let menuListDom of menuListsDom) {
            const classes = Object.values(await menuListDom.evaluate((el) => el.classList, menuListDom[i]))
            const getLastObject = subCategories.length - 1

            if (classes.find((value) => value == "text-body-2")) {

                const valueCategory = await page.evaluate((el) => el.textContent, menuListDom)
                const href = await page.evaluate((el) => el.href, menuListDom)
                subCategories[getLastObject].level2.push({
                    value: valueCategory,
                    href: href
                })

            } else if (classes.find((value) => value == "text-body1-strong")) {
                subCategories.push({
                    level2: {
                        name: await page.evaluate((el) => el.textContent, menuListDom),
                        href: await page.evaluate((el) => el.href, menuListDom)
                    },
                    level3: []
                })
            } else {
                console.error("pattern changed please update")
            }
        }
        console.log(nameFirstLevelCategory)
        console.log(inspect(subCategories, {depth: null}))
        //await fs.writeFile("./test.html", menuListValues)

    }

}


main()

