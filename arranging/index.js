const fs = require("fs")
const { join } = require("path")

const checkSpecsIsSame = require("./checkSpecs")
const delUnequalSpecs = require("./delUnequalSpecs")
const filterProductsById = require("./filterProducts")
const getAllCategoriesId = require("./categoriesId")
const delNotAvailableSpecs = require("./delNotAvailable")

fs.readFile("../result/products.json", { encoding: "utf-8" }, (err, data) => {
    if (err) {
        console.log(err)
    } else {
        const products = JSON.parse(data)
        const categories_id = getAllCategoriesId(products)

        const unequalSpecsPattern = []
        const [filteredProducts, removed] = delNotAvailableSpecs(products)

        for (const id of categories_id) {
            const productsSameCategory = filterProductsById(filteredProducts, id)

            if (productsSameCategory.length > 0) {
                let resultCheck = checkSpecsIsSame(productsSameCategory)
                if (resultCheck.status) {
                    console.log(`${id} is ok`)
                } else {
                    unequalSpecsPattern.push({
                        id: id,
                        unequalKeys: resultCheck.unequalKeys
                    })
                }
            }
        }

        const finalProducts = delUnequalSpecs(filteredProducts, unequalSpecsPattern)
        fs.writeFileSync(join(__dirname, "../result/arrangedProducts.json"), JSON.stringify(finalProducts), { encoding: "utf-8" })
    }
})