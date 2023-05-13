const queryAsync = require("./db")
const { join } = require("path")
const fs = require("fs")


fs.readFile(join(__dirname, "/../result/category.json"), { encoding: "utf-8" }, async (err, data) => {
    const categories = JSON.parse(data)

    if (err) {

        console.error("have error in read file resource")
        console.log(err)

    } else {

        try {

            for (let category of categories) {

                const nameCategoryFirstLevel = category.firstLevel.name
                await queryAsync("INSERT INTO product_categories(name) VALUES(?)", [nameCategoryFirstLevel])
                const firstLevelId = (await queryAsync("SELECT id FROM product_categories WHERE name=?", [nameCategoryFirstLevel]))[0].id

                if (category.lastLevel.length > 0) {
                    for (let lastLevel of category.lastLevel) {
                        const nameCategoryLastLevel = lastLevel.value
                        await queryAsync("INSERT INTO product_categories(name, parent_id)  VALUES(?, ?)", [nameCategoryLastLevel, firstLevelId])
                    }
                }

                console.log(`category ${nameCategoryFirstLevel} added succussFully`)
            }

        } catch (err) {

            console.log(err)

        }

    }
})




