const crawlersRunner = require("./core")
const categoryCrawler = require('./crawlers/category')

const menuQuery = ".base-layout-desktop-header-navigation_BaseLayoutDesktopHeaderNavigation__megaMenuContainer__ipIFg"
const url = "https://www.digikala.com/" 

const [startCrawler, addCrawler] = crawlersRunner(url, menuQuery, true)

addCrawler(categoryCrawler)
startCrawler()