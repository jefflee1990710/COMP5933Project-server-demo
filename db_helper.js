const insertHashStoreRecord = (db, pubKey, h1, c1, h2, c2, h3, c3) => {
    return new Promise((resolve, reject) => {
        db.run(`insert into hashstore (pubkey, h1, c1, h2, c2, h3, c3) values ('${pubKey}', '${h1}', '${c1}', '${h2}', '${c2}', '${h3}', '${c3}')`, (err) => {
            if(err){
                reject(err)
            }else{
                resolve()
            }
        })
    })
}

const findHash = (db, pubKey, h1, h2, h3) => {
    return new Promise((resolve, reject) => {
        db.all(`select * from hashstore where pubKey='${pubKey}' and h1='${h1}' and h2='${h2}' and h3='${h3}'`, [], (err, rows) => {
            if(err){
                reject(err)
            }else{
                resolve(rows)
            }
        })
    })
}

module.exports = {
    insertHashStoreRecord,
    findHash
}