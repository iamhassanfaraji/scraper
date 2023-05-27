function filterProductsById(products, id) {
    const productSameCategory = []

    products.forEach((product) => {
        if (product.category_id == id) {
            productSameCWategory.push(product)
        }
    })

    return productSameCategory
}


module.exports = filterProductsById