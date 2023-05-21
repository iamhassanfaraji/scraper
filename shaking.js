const fs = require("fs")
const { join } = require("path")

function checkSpecsIsSame(products) {
    const response = {
        status: false,
        unequalKeys: []
    }

    const resultCheckPairAreEqual = []
    products.forEach((product, key) => {
        const nextKeyProduct = key + 1
        if (nextKeyProduct != products.length) { //prevent run for last product, dont have next product!

            const aKeys = Object.keys(product.specs)
            const bKeys = Object.keys(products[nextKeyProduct].specs)

            const pairKayFound = []

            aKeys.forEach((keyA, indexA) => {
                const indexB = bKeys.findIndex((item) => item == keyA)
                if(indexB != -1){
                    pairKayFound.push(keyA)
                }
            })

            const badKeysFromA = aKeys.filter((key) => {
                let resultCheckKeysNotPair = true
                pairKayFound.forEach((pairKey) => {
                    if (key == pairKey) {
                        resultCheckKeysNotPair = false
                    }
                })
                return resultCheckKeysNotPair
            })

            const badKeysFromB = bKeys.filter((key)=>{
                let resultCheckKeysNotPair = true
                pairKayFound.forEach((pairKey) => {
                    if (key == pairKey) {
                        resultCheckKeysNotPair = false
                    }
                })
                return resultCheckKeysNotPair
            })


            if (badKeysFromA.length > 0 || badKeysFromB.length > 0) {
                response.unequalKeys.push(...badKeysFromA, ...badKeysFromB)
                resultCheckPairAreEqual.push(false)
            } else {
                resultCheckPairAreEqual.push(true)
            }

        }
    })

    if (resultCheckPairAreEqual.every((item) => item == true)) {
        response.status = true
    }
    return response
}

function delNotAvailableSpecs(products) {
    const removed = []
    const productsFiltered = products.filter((product) => {
        if (Object.values(product.specs).length > 0) {
            return true
        }
        return false
    })

    return [productsFiltered, removed]
}

function getNonRepetitiveCategoryId(products) {
    const categories_id = []

    products.forEach(product => {
        if (categories_id.every((id) => id != product.category_id)) {
            categories_id.push(product.category_id)
        }
    })

    return categories_id
}

function productsSameCategoryById(products, id) {
    const productSameCategory = []

    products.forEach((product) => {
        if (product.category_id == id) {
            productSameCategory.push(product)
        }
    })

    return productSameCategory
}

function delUnequalSpecs(products, unequalKeys) {
    const newProducts = [...products]

    for (const key of unequalKeys) {
        products.forEach((product, index) => {
            if (product.category_id == key.id) {
                key.unequalKeys.forEach((item) => {
                    const newSpecs = newProducts[index].specs
                    delete newSpecs[item]
                    newProducts[index].specs = newSpecs
                })
            }
        })
    }

    return delNotAvailableSpecs(products)[0]
}



fs.readFile("./result/products.json", { encoding: "utf-8" }, (err, data) => {
    if (err) {
        console.log(err)
    } else {
        const products = JSON.parse(data)
        const categories_id = getNonRepetitiveCategoryId(products)

        const unequalSpecsPattern = []
        const [filteredProducts, removed] = delNotAvailableSpecs(products)

        for (const id of categories_id) {
            const productsSameCategory = productsSameCategoryById(filteredProducts, id)

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
        fs.writeFileSync(join(__dirname, "result/finalProducts.json"), JSON.stringify(finalProducts), { encoding: "utf-8" })
    }
})