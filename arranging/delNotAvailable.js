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

module.exports = delNotAvailableSpecs