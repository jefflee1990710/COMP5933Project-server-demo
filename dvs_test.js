let {
    schnorrGroupSetting, 
    bankSetting,
    getRandomNumber,
    generateDVP,
    verifyDVP,
    generateDVS,
    verifyDVS,
    hashMessage,
    signature
} = require('./prime')
const BigNumber = require('bignumber.js')

let {p, q, g} = schnorrGroupSetting

// let priKey = BigNumber("3")
// let pubKey = BigNumber("3")

let priKey = BigNumber("63")
let pubKey = BigNumber("61")

let m = BigNumber(2)
console.log('Message : ', m.toString())
m = hashMessage(m)
console.log('Message after hashing : ', m.toString())

let s = signature(m, priKey)
console.log('Signature s : ', s.toString())

let P = generateDVP(priKey, bankSetting.pubKey, m)
console.log('Generated DVP : ', P)
let success = verifyDVP(pubKey, bankSetting.pubKey, m, s, P)
console.log('Verification result : ', success)


console.log('====================')

message = "Lee Chi Hang"
let DVS = generateDVS(priKey, bankSetting.pubKey, message)
console.log('Generated DVS : ', DVS)
success = verifyDVS(pubKey, bankSetting.pubKey, DVS)
console.log('Verify DVS result : ', success)