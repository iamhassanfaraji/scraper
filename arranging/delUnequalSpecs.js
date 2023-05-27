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


module.exports = delUnequalSpecs