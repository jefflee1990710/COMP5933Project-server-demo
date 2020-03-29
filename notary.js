const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser')
const Joi = require('joi')
const prime = require('./prime')
const cors = require('cors')
const setting = prime.schnorrGroupSetting
const {
    insertHashStoreRecord,
    findHash
} = require('./db_helper')

let db = new sqlite3.Database('./core.db');
db.run('create table if not exists hashstore(id integer primary key, pubkey VARACHAR, h1 VARACHAR, c1 VARACHAR, h2 VARACHAR, c2 VARACHAR, h3 VARACHAR, c3 VARACHAR)')

var express = require("express");
var app = express();
app.use(bodyParser.json());
app.use(cors())

const delay = (ms) => {
    return new Promise((resolve, reject) => {
        try{
            setTimeout(() => {
                resolve()
            }, ms)
        }catch(err){
            reject(err)
        }
    })
}

const registerSchema = Joi.object({
    H1 : Joi.string().required(),
    C1 : Joi.string().required(),
    H2 : Joi.string().required(),
    C2 : Joi.string().required(),
    H3 : Joi.string().required(),
    C3 : Joi.string().required()
})

const verifySchema = Joi.object({
    pubKey : Joi.string().required(),
    H1 : Joi.string().required(),
    H2 : Joi.string().required(),
    H3 : Joi.string().required()
})

const leakAndDismissSecretSchema = Joi.object({
    priKey : Joi.string().required()
})

const lostSecretStep1Schema = Joi.object({
    commitment : Joi.string().required()
})

const lostSecretStep2Schema = Joi.object({
    response : Joi.string().required()
})

app.post("/register", async (req, res, next) => {
    console.log('--------------------------------------')
    console.log('Starting register API...')
    const {error, value} = registerSchema.validate(req.body)
    if(error){
        return res.send({
            ts : new Date(),
            success : false,
            error : error.details.map((r) => r.message)
        })    
    }

    try{
        let {
            H1, C1, H2, C2, H3, C3
        } = value
        console.log('User\'s registration information : ', value)
    
        // Calculate public key and private key
        let priKey = prime.getRandomNumber(2, setting.q)
        let pubKey = (setting.g.pow(priKey)).modulo(setting.p)
        console.log('Generated public key : ', pubKey.toString())
        console.log('Generated private key : ', priKey.toString())

        // Public key store with those hash value
        console.log('Saving to database.....')
        await insertHashStoreRecord(db, pubKey.toString(10), H1, C1, H2, C2, H3, C3)

        await delay(500) // Too fast, little delay make better UX
        console.log('Saving done!')
        console.log('API finish!')
        return res.send({
            ts : new Date(),
            success : true,
            userKp : {
                priKey : priKey.toString(), 
                pubKey : pubKey.toString()
            }
        })
    }catch(err){
        console.log(err)
        return res.send({
            ts : new Date(),
            success : false,
            error : `${err}`
        })
    }
});

app.post("/verify", async (req, res, next) => {
    console.log('--------------------------------------')
    const {error, value} = verifySchema.validate(req.body)
    if(error){
        return res.send({
            ts : new Date(),
            success : false,
            error : error.details.map((r) => r.message)
        })    
    }
    try{
        let {
            pubKey, H1, H2, H3
        } = value

        console.log('User value to check : ', value)
    
        // await delay(500) // Too fast, little delay make better UX

        console.log('Search hash in database....')
        let rows = await findHash(db, pubKey, H1, H2, H3)
        console.log('Query done! Number of records found : ', rows.length)

        console.log('API finish!')
        return res.send({
            ts : new Date(),
            success : true,
            isExist : rows.length > 0
        })
    }catch(err){
        console.log(err)
        return res.send({
            ts : new Date(),
            success : false,
            error : `${err}`
        })
    }
});

app.listen(4000, () => {
    console.log("Server running on port 4000");
});