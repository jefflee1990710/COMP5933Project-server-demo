const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser')
const Joi = require('joi')
const cors = require('cors')
const prime = require('./prime')
const https = require('https')
const axios = require('axios').default

let db = new sqlite3.Database('./core.db');

var express = require("express");
var app = express();
app.use(bodyParser.json());
app.use(cors())

const verifySchema = Joi.object({
    pubKey : Joi.string().required(),
    S : Joi.string().required(),
    H1 : Joi.string().required(),
    H2 : Joi.string().required(),
    H3 : Joi.string().required()
})

app.post("/verify", async (req, res, next) => {
    console.log('--------------------------------------')
    console.log('Verifying start...')
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
            pubKey, S, H1, H2, H3
        } = value
    
        S = JSON.parse(S)
        // console.log(S)
        
        console.log('Verifying DVS...')
        let verification = prime.verifyDVS(pubKey, prime.bankSetting.pubKey, S)
        console.log('DVS verification result : ', verification)
    
        console.log('Checking hash from notary server ...')
        let request = {
            pubKey,
            H1, H2, H3
        }
        console.log('Sending request : ', request)
        let response = await axios.post('http://localhost:4000/verify', request)
              
        return res.send({
            ts : new Date(),
            success : true,
            dvsValidation : verification,
            hashValidation : response.data.success ? response.data.isExist : false
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

app.listen(4001, () => {
    console.log("Server running on port 4001");
});