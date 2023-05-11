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

            for (let firstLevel in categories) {

                const nameCategoryFirstLevel = firstLevel
                await queryAsync("INSERT INTO product_categories(name) VALUES(?)", [nameCategoryFirstLevel])
                const firstLevelId = await queryAsync("SELECT id FROM product_categories WHERE name=?", [nameCategoryFirstLevel])

                for (let midLevel of categories[firstLevel]) {

                    const nameCategoryMidLevel = midLevel.level2.name
                    await queryAsync("INSERT INTO product_categories(name, parent_id)  VALUES(?, ?)", [nameCategoryMidLevel, firstLevelId[0].id])
                    const midLevelId = await queryAsync("SELECT id FROM product_categories WHERE name=?", [nameCategoryMidLevel])

                    if (midLevel.level3.length > 0) {

                        for (let lastLevel of midLevel.level3) {
                            const nameCategoryLastLevel = lastLevel.value
                            await queryAsync("INSERT INTO product_categories(name, parent_id)  VALUES(?, ?)", [nameCategoryLastLevel, midLevelId[0].id])
                        }

                    }

                }

                console.log(`category ${nameCategoryFirstLevel} added succussFully`)
            }

        } catch (err) {

            console.log(err)

        }

    }
})




