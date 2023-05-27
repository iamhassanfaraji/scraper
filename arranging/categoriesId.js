function getAllCategoriesId(products) {
    const categories_id = []

    products.forEach(product => {
        if (categories_id.every((id) => id != product.category_id)) {
            categories_id.push(product.category_id)
        }
    })

    return categories_id
}


module.exports = getAllCategoriesId