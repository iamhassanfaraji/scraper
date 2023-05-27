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

            aKeys.forEach((keyA) => {
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


module.exports = checkSpecsIsSame