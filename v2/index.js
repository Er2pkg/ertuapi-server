let memes = require('/app/memes.js'),
    tokens = require('/app/tokens.js'),
    xp = require('/app/xp.json'),
    dailies = require('/app/dailies.json')
const express = require('express'),
      router = express.Router(),
      apikey = (key) => tokens.find(x => x.token === key && x.active)?true:false,
      random = (min, max) => Math.floor(Math.random() * (max + 1 - min)) + min,
      totalUses = (key) => tokens.find(x => x.token === key && x.active).totalUses || '∞'
router.get('/meme', (req, res) => {
const datas = req.headers
if(!datas.token) return res.status(200).json({status: 400, message: 'Please, provide a token in header as "token: Bot XXXXXXXXXXX"'})
if(!datas.token.startsWith('Bot ')) return res.status(200).json({status: 400, message: 'Token must be started to "Bot "'})
if(!apikey(datas.token.replace(/Bot /, ''))) return res.status(200).json({status: 403, message: 'Token is not vadilate'})
const itemems = memes.filter(x => x.allowed === true)
if(!itemems) return res.status(200).json({status: 500, message: 'Memes not found'})
const num = random(0, itemems.length - 1)
const ct = tokens.find(x => x.token === datas.token.replace(/Bot /, '') && x.active)
if(!ct.uses) ct.uses = 1
else ct.uses += 1
if(totalUses(datas.token.replace(/Bot /, '')) !== '∞' && (totalUses(datas.token.replace(/Bot /, '')) - ct.uses) <= 0) return res.status(200).json({status: 429, message: 'You have exceeded your requests per day'})
console.log('REQUEST MEME FROM token ' + datas.token + ' USES: ' + ct.uses + '/' + totalUses(datas.token.replace(/Bot /, '')))
res.status(200).json({status: 200, url: itemems[num].url})
})
router.get('/profile', (req, res) => {
const datas = req.headers, datas2 = req.query
if(!datas.token) return res.status(200).json({status: 400, message: 'Please, provide a token in header as "token: Bot XXXXXXXXXXX"'})
if(!datas.token.startsWith('Bot ')) return res.status(200).json({status: 400, message: 'Token must be started to "Bot "'})
if(!apikey(datas.token.replace(/Bot /, ''))) return res.status(200).json({status: 403, message: 'Token is not vadilate'})
if(datas.token.replace(/Bot /, '') === 'ertuapitest') return res.status(200).json({status: 403, message: 'API key is not allowed to this method'})
const ct = tokens.find(x => x.token === datas.token.replace(/Bot /, '') && x.active)
if(!ct.uses) ct.uses = 1
else ct.uses += 1
if(totalUses(datas.token.replace(/Bot /, '')) !== '∞' && totalUses(datas.token.replace(/Bot /, '')) === ct.uses) return res.status(200).json({status: 429, message: 'You have exceeded your requests per day'})
console.log('REQUEST PROFILE FROM token ' + datas.token.replace(/Bot /, '') + ' USES: ' + ct.uses + '/' + totalUses(datas.token.replace(/Bot /, '')))
if(datas2.method === 'add'){
    if(!datas2.user) return res.status(200).json({status: 401, message: 'Provide a userID'})
    if(!datas2.money || !datas2.level || !datas2.xp) return res.status(200).json({status: 401, message: 'Provide a value(s)'})
    if(!xp[datas.token.replace(/Bot /, '')]) xp[datas.token.replace(/Bot /, '')] = []
    let uCheck = xp[datas.token.replace(/Bot /, '')].find(i => i.id === datas2.user)
    if(!uCheck) xp[datas.token.replace(/Bot /, '')].push({id: datas2.user, xp: 0, level: 1, money: 0, bg: 'https://cdn.mee6.xyz/plugins/levels/cards/backgrounds/4cc81b4c-c779-4999-9be0-8a3a0a64cbaa.jpg',})
    uCheck = xp[datas.token.replace(/Bot /, '')].find(i => i.id === datas2.user)
    if(!uCheck.bg) uCheck.bg = 'https://cdn.mee6.xyz/plugins/levels/cards/backgrounds/4cc81b4c-c779-4999-9be0-8a3a0a64cbaa.jpg'
    if(datas2.money) uCheck.money += parseInt(datas2.money)
    if(datas2.level) uCheck.level += parseInt(datas2.level)
    if(  datas2.xp )  uCheck.xp   += parseInt(  datas2.xp )
    //fs.writeFile('./xp.js', 'module.exports = ' + JSON.stringify(xp), err => err?console.log(err):'')
    return res.status(200).json({status: 200, profile: uCheck})
}
if(datas2.method === 'remove'){
    if(!datas2.user) return res.status(200).json({status: 401, message: 'Provide a userID'})
    if(!datas2.money || !datas2.level || !datas2.xp) return res.status(200).json({status: 401, message: 'Provide a value(s)'})
    if(!xp[datas.token.replace(/Bot /, '')]) xp[datas.token.replace(/Bot /, '')] = []
    let uCheck = xp[datas.token.replace(/Bot /, '')].find(i => i.id === datas2.user)
    if(!uCheck) xp[datas.token.replace(/Bot /, '')].push({id: datas2.user, xp: 0, level: 1, money: 0, bg: 'https://cdn.mee6.xyz/plugins/levels/cards/backgrounds/4cc81b4c-c779-4999-9be0-8a3a0a64cbaa.jpg',})
    uCheck = xp[datas.token.replace(/Bot /, '')].find(i => i.id === datas2.user)
    if(datas2.money) uCheck.money += parseInt(datas2.money)
    if(datas2.level) uCheck.level += parseInt(datas2.level)
    if(  datas2.xp )  uCheck.xp   += parseInt(  datas2.xp )
    //fs.writeFile('./xp.js', 'module.exports = ' + JSON.stringify(xp), err => err?console.log(err):'')
    return res.status(200).json({status: 200, profile: uCheck})
}
if(datas2.method === 'set'){
    if(!datas2.user) return res.status(200).json({status: 401, message: 'Provide a userID'})
    //if(!datas2.bg || !datas2.money || !datas2.level || !datas2.xp) return res.status(200).json({status: 401, message: 'Provide a value(s)'})
    if(!xp[datas.token.replace(/Bot /, '')]) xp[datas.token.replace(/Bot /, '')] = []
    let uCheck = xp[datas.token.replace(/Bot /, '')].find(i => i.id === datas2.user)
    if(!uCheck) xp[datas.token.replace(/Bot /, '')].push({id: datas2.user, xp: 0, level: 1, money: 0, bg: 'https://cdn.mee6.xyz/plugins/levels/cards/backgrounds/4cc81b4c-c779-4999-9be0-8a3a0a64cbaa.jpg',})
    uCheck = xp[datas.token.replace(/Bot /, '')].find(i => i.id === datas2.user)
    if(datas2.money) uCheck.money = parseInt(datas2.money)
    if(datas2.level) uCheck.level = parseInt(datas2.level)
    if(  datas2.xp )  uCheck.xp   = parseInt(  datas2.xp )
    if(datas2.bg) uCheck.bg = datas2.bg
    //fs.writeFile('./xp.js', 'module.exports = ' + JSON.stringify(xp), err => err?console.log(err):'')
    return res.status(200).json({status: 200, profile: xp[datas.token.replace(/Bot /, '')].find(i => i.id === datas2.user)})
}
if(datas2.method === 'check'){
    if(!datas2.user) return res.status(200).json({status: 401, message: 'Provide a userID'})
    if(!xp[datas.token.replace(/Bot /, '')]) xp[datas.token.replace(/Bot /, '')] = []
    let uCheck = xp[datas.token.replace(/Bot /, '')].find(i => i.id === datas2.user)
    if(!uCheck) xp[datas.token.replace(/Bot /, '')].push({id: datas2.user, xp: 0, level: 1, money: 0, bg: 'https://cdn.mee6.xyz/plugins/levels/cards/backgrounds/4cc81b4c-c779-4999-9be0-8a3a0a64cbaa.jpg',})
    uCheck = xp[datas.token.replace(/Bot /, '')].find(i => i.id === datas2.user)
    return res.status(200).json({status: 200, profile: uCheck})
}
if(datas2.method === 'reset'){
    xp[datas.token.replace(/Bot /, '')] = []
    //fs.writeFile('./xp.js', 'module.exports = ' + JSON.stringify(xp), err => err?console.log(err):'')
    return res.status(200).json({status: 200, message: 'Reset successfully'})
}
    /*return*/ res.status(200).json({status: 403, message: 'Provide a method.'})
})
    
router.get('/daily', (req, res) => {
const datas = req.headers, datas2 = req.query
if(!datas.token) return res.status(200).json({status: 400, message: 'Please, provide a token in header as "token: Bot XXXXXXXXXXX"'})
if(!datas.token.startsWith('Bot ')) return res.status(200).json({status: 400, message: 'Token must be started to "Bot "'})
if(!apikey(datas.token.replace(/Bot /, ''))) return res.status(200).json({status: 403, message: 'Token is not vadilate'})
if(datas.token.replace(/Bot /, '') === 'ertuapitest') return res.status(200).json({status: 403, message: 'API key is not allowed to this method'})
const ct = tokens.find(x => x.token === datas.token.replace(/Bot /, '') && x.active)
if(!ct.uses) ct.uses = 1
else ct.uses += 1
if(totalUses(datas.token.replace(/Bot /, '')) !== '∞' && totalUses(datas.token.replace(/Bot /, '')) === ct.uses) return res.status(200).json({status: 429, message: 'You have exceeded your requests per day'})
console.log('REQUEST DAILY FROM token ' + datas.token.replace(/Bot /, '') + ' USES: ' + ct.uses + '/' + totalUses(datas.token.replace(/Bot /, '')))    
if(!datas2.user) return res.status(200).json({status: 401, message: 'Provide a userID'})
if(!dailies[datas2.token]) dailies[datas2.token] = []
let dCheck = dailies[datas2.token].find(i => i.id === datas2.user)
if(!dCheck) dailies[datas2.token].push({id: datas2.user, dailied: 0})
    if(dCheck && dCheck.dailied === 1 && dCheck.endTime - Date.now() <= 0) {
    dailies[datas2.token][dailies[datas2.token].findIndex(i => i.id === datas2.user)] = {id: datas2.user, dailied: 0}
    }
dCheck = dailies[datas2.token].find(i => i.id === datas2.user)
if(datas2.method === 'info') {
    return res.status(200).json({status: 200, dailyInfo: dCheck, left: dCheck.dailied === 1?dCheck.endTime - Date.now(): undefined})
}
if(datas2.method === 'set') {
    let str
    if(!datas2.time) str = '24h'
    else str = datas2.time
    let seconds = 0
    let weeks = str.match(/(\d+)\s*w/);
    let days = str.match(/(\d+)\s*d/);
    let hours = str.match(/(\d+)\s*h/);
    let minutes = str.match(/(\d+)\s*m/);
    let secs = str.match(/(\d+)\s*s/);
    if (weeks) { seconds += parseInt(weeks[1])*604800; }
    if (days) { seconds += parseInt(days[1])*86400; }
    if (hours) { seconds += parseInt(hours[1])*3600; }
    if (minutes) { seconds += parseInt(minutes[1])*60; }
    if (secs) { seconds += parseInt(secs[1]); }
    if(seconds < 5) seconds = 5
    if(seconds > 1209600) seconds = 1209600
    if(dCheck.dailied === 1) return res.status(200).json({status: 401, endTime: dCheck.endTime, startTime: dCheck.startTime, left: dCheck.endTime - Date.now()})
    dCheck.dailied = 1
    dCheck.endTime = Date.now() + (seconds * 1000)
    dCheck.startTime = Date.now()
    return res.status(200).json({status: 200, dailyInfo: dCheck, left: dCheck.endTime - Date.now()})
}
    res.status(200).json({status: 403, message: 'Provide a method.'})
})
module.exports = router