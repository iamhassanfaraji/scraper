const mysql = require("mysql2")

const connectDb = mysql.createPool({
    host: "127.0.0.1",
    user: "admin",
    port: 3306,
    database: "vitrineshahre",
    multipleStatements: true,
    password: "&&246PR8nPJ0"
})

function queryAsync(sql, values) {
    return new Promise((resolve, reject) => {
        connectDb.query(sql, values ? values : null, (err, result) => {
            if (err) {
                reject(err)
            } else {
                resolve(result)
            }
        })
    })
}

module.exports = queryAsync