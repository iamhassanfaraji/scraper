async function crawler(page, readData){
    const result = await readData(
        '.base-layout-desktop-header-navigation_BaseLayoutDesktopHeaderNavigation__navGroup__bGWtA',
        ".BaseLayoutDesktopHeaderNavigationMainMegaMenu_BaseLayoutDesktopHeaderNavigationMainMegaMenu__mainCategoriesSection__QDkXq a p"
    )
    console.log(result)
}

module.exports = crawler