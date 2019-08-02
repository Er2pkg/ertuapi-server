const express = require('express')
const mongoose = require('mongoose')
const nodemailer = require('nodemailer')
const bodyParser = require('body-parser')
const fs = require('fs')
const app = express()
const path = require('path')
//
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname);
//
const Schema = mongoose.Schema
let memes = require('./memes.js')
let tokens = require('./tokens.js')
let users = require('./users.json')
let xp = require('./xp.json')
let dailies = require('./dailies.json')

const random = (min, max) => Math.floor(Math.random() * (max + 1 - min)) + min
const apikey = (key) => tokens.find(x => x.token === key && x.active)?true:false
const scmd = (cmd) => require('child_process').execSync(cmd).toString('utf8')
const totalUses = (key) => tokens.find(x => x.token === key && x.active).totalUses || '∞'
                                       
let modules = []
for(p in require('./package.json').dependencies) modules.push({name: p})
modules = modules.map(i => i.name).join(', ')

    let transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "ertu.datacenter@gmail.com",
        pass: process.env.PASS
      }
})
    
const updXp = () => {
let sf = (file, value) => fs.writeFile('./' + file, value, err => err?console.log(err):'')
sf('xp.json', JSON.stringify(xp))
for(z in dailies) {
  if(dailies[z].length > 1) dailies[z].forEach(p => {
    if(p.dailied === 1 && Date.now() - p.endTime <= 0) p = {id: p.id, dailied: 0}
  })
}
sf('dailies.json', JSON.stringify(dailies))
}
updXp()

setInterval(() => updXp(), 15000)

/*memes.forEach(m => m.allowed = true)
fs.writeFile('./memes.js', 'module.exports =' + JSON.stringify(memes), err => err?console.log(err):'')*/
//xp['}n0522vlmd09bot'].forEach(i => i.bg === 'https://cdn.discordapp.com/attachments/556868793855377408/586160152479268895/rankbg.jpg'?i.bg = 'https://cdn.mee6.xyz/plugins/levels/cards/backgrounds/4cc81b4c-c779-4999-9be0-8a3a0a64cbaa.jpg':'')


app.get('/', (req, res) => res.redirect('/api'))

/*app.get('/api', (req, res) => {
  res.sendFile(path.join(__dirname, './site', 'main.html'));
})*/
app.get('/api', (req, res) => {
  res.render(__dirname+'/views/index.html', { title: 'Ertu datacenter API', modules:modules, node: scmd('node -v'), npm: scmd('npm -v')});
})
//Движ на pug
app.get('/register', (req, res) => {
  res.send(`<form action='/registerapi'>
<label>Register</label></br>
<input type='text' name='name' placeholder='Name' require></br>
<input type='password' name='password' placeholder='Password (will be encrypted)' require></br>
<input type='email'name='email'placeholder='E-Mail (will be send token)'require></br>
<input type='submit' value='Register'></form>`)
})

app.get('/registerapi', async (req, res) => {
  const datas = req.query
  if(!datas) return res.redirect('back')
  if(!datas.name) return res.redirect('back')
  if(!datas.password) return res.redirect('back')
  if(!datas.email) return res.redirect('back')
  if(users[datas.email]) return res.redirect('back')
  const gentoken = Math.random().toString(36).slice(2); 
  await transporter.sendMail({
    from: '"Ertu DataCenter Bot" ertu.datacenter@gmail.com',
    to: datas.email,
    subject: "Your token",
    html: `Your token to using API of Ertu DataCenter: ${gentoken}`
})
  users[datas.email] = {email: datas.email, name: datas.name, pass: datas.password, token: gentoken}
  tokens.push({token: gentoken, active: true})
  await fs.writeFile('./tokens.js', 'module.exports = ' + JSON.stringify(tokens), err => err?console.log(err):'')
  await fs.writeFile('./users.json', JSON.stringify(users), err => err?console.log(err):'')
  res.status(200).redirect('/')
})

app.get('/api/meme', (req, res) => {
const datas = req.query
if(!datas.token) return res.status(200).json({status: 401, message: 'Error! Require to provide a token.'})
if(!apikey(datas.token)) return res.status(200).json({status: 403, message: 'Error! Token is not vadilate'})
const itemems = memes.filter(x => x.allowed === true)
if(!itemems) return res.status(200).json({status: 500, message: 'Memes not found...'})
const num = random(0, itemems.length - 1)
const ct = tokens.find(x => x.token === datas.token && x.active)
if(!ct.uses) ct.uses = 1
else ct.uses += 1
if(totalUses(datas.token) !== '∞' && (totalUses(datas.token) - ct.uses) <= 0) return res.status(200).json({status: 429, message: 'You have exceeded your requests per day'})
console.log('REQUEST MEME FROM TOKEN ' + datas.token + ' USES: ' + ct.uses + '/' + totalUses(datas.token))
res.status(200).json({status: 200, url: itemems[num].url})
})

app.get('/api/memeadd', (req, res) => {
const datas = req.query
if(!datas.token) return res.status(200).json({status: 401, message: 'Error! Require to provide a token.'})
if(datas.token === 'ertuapitest') return res.status(200).json({status: 403, message: 'In test API key not allowed to add a memes'})
if(!apikey(datas.token)) return res.status(200).json({status: 403, message: 'Error! Token is not vadilate'})
if(!datas.url) return res.status(200).json({status: 401, message: 'Error! Require to provide a URL.'})
if(memes.find(c => c.url === datas.url)) return res.status(200).json({status: 409, message: 'This meme has in base'})
memes.push({url: datas.url, allowed: false})
const ct = tokens.find(x => x.token === datas.token && x.active)
if(!ct.uses) ct.uses = 1
else ct.uses += 1
if(totalUses(datas.token) !== '∞' && totalUses(datas.token) === ct.uses) return res.status(200).json({status: 429, message: 'You have exceeded your requests per day'})
console.log('REQUEST MEMEADD FROM TOKEN ' + datas.token + ' USES: ' + ct.uses + '/' + totalUses(datas.token))
res.status(200).json({status: 200, url: datas.url})
console.log('+ MEME ' + datas.url + ' FROM TOKEN ' + datas.token)
fs.writeFile('./memes.js', 'module.exports = ' + JSON.stringify(memes), err => err?console.log(err):'')
})

app.get('/api/keycheck', (req, res) => res.status(200).json({status: 200, has: apikey(req.query.key || 0), test: req.query.key === 'ertuapitest'?true:false}))

app.get('/api/profile', (req, res) => {
const datas = req.query
if(!datas.token) return res.status(200).json({status: 401, message: 'Error! Require to provide a token.'})
if(datas.token.search(/user|bot/g) < 0) return res.status(200).json({status: 403, message: 'Provide a scope in token.', example: 'token=' + datas.token + 'bot'})
if(!apikey(datas.token.replace(/user|bot/g, ''))) return res.status(200).json({status: 403, message: 'Error! Token is not vadilate'})
const ct = tokens.find(x => x.token === datas.token.replace(/user|bot/g, '') && x.active)
if(!ct.uses) ct.uses = 1
else ct.uses += 1
if(totalUses(datas.token.replace(/user|bot/g, '')) !== '∞' && totalUses(datas.token.replace(/user|bot/g, '')) === ct.uses) return res.status(200).json({status: 429, message: 'You have exceeded your requests per day'})
console.log('REQUEST PROFILE FROM TOKEN ' + datas.token.replace(/user|bot/g, '') + ' USES: ' + ct.uses + '/' + totalUses(datas.token.replace(/user|bot/g, '')))
if(datas.method === 'add'){
    if(!datas.user) return res.status(200).json({status: 401, message: 'Provide a userID'})
    if(!datas.money || !datas.level || !datas.xp) return res.status(200).json({status: 401, message: 'Provide a value(s)'})
    if(!xp[datas.token]) xp[datas.token] = []
   let uCheck = xp[datas.token].find(i => i.id === datas.user)
    if(!uCheck) xp[datas.token].push({id: datas.user, xp: 0, level: 1, money: 0, bg: 'https://cdn.mee6.xyz/plugins/levels/cards/backgrounds/4cc81b4c-c779-4999-9be0-8a3a0a64cbaa.jpg',})
    uCheck = xp[datas.token].find(i => i.id === datas.user)
    if(!uCheck.bg) uCheck.bg = 'https://cdn.mee6.xyz/plugins/levels/cards/backgrounds/4cc81b4c-c779-4999-9be0-8a3a0a64cbaa.jpg'
    if(datas.money) uCheck.money += parseInt(datas.money)
    if(datas.level) uCheck.level += parseInt(datas.level)
    if(  datas.xp )  uCheck.xp   += parseInt(  datas.xp )
  //fs.writeFile('./xp.js', 'module.exports = ' + JSON.stringify(xp), err => err?console.log(err):'')
  return res.status(200).json({status: 200, profile: uCheck})
}
if(datas.method === 'remove'){
    if(!datas.user) return res.status(200).json({status: 401, message: 'Provide a userID'})
    if(!datas.money || !datas.level || !datas.xp) return res.status(200).json({status: 401, message: 'Provide a value(s)'})
        if(!xp[datas.token]) xp[datas.token] = []
  let uCheck = xp[datas.token].find(i => i.id === datas.user)
    if(!uCheck) xp[datas.token].push({id: datas.user, xp: 0, level: 1, money: 0, bg: 'https://cdn.mee6.xyz/plugins/levels/cards/backgrounds/4cc81b4c-c779-4999-9be0-8a3a0a64cbaa.jpg',})
    uCheck = xp[datas.token].find(i => i.id === datas.user)
    if(datas.money) uCheck.money += parseInt(datas.money)
    if(datas.level) uCheck.level += parseInt(datas.level)
    if(  datas.xp )  uCheck.xp   += parseInt(  datas.xp )
  //fs.writeFile('./xp.js', 'module.exports = ' + JSON.stringify(xp), err => err?console.log(err):'')
  return res.status(200).json({status: 200, profile: uCheck})
}
if(datas.method === 'set'){
    if(!datas.user) return res.status(200).json({status: 401, message: 'Provide a userID'})
    //if(!datas.bg || !datas.money || !datas.level || !datas.xp) return res.status(200).json({status: 401, message: 'Provide a value(s)'})
    if(!xp[datas.token]) xp[datas.token] = []
    let uCheck = xp[datas.token].find(i => i.id === datas.user)
    if(!uCheck) xp[datas.token].push({id: datas.user, xp: 0, level: 1, money: 0, bg: 'https://cdn.mee6.xyz/plugins/levels/cards/backgrounds/4cc81b4c-c779-4999-9be0-8a3a0a64cbaa.jpg',})
    uCheck = xp[datas.token].find(i => i.id === datas.user)
    if(datas.money) uCheck.money = parseInt(datas.money)
    if(datas.level) uCheck.level = parseInt(datas.level)
    if(  datas.xp )  uCheck.xp   = parseInt(  datas.xp )
    if(datas.bg) uCheck.bg = datas.bg
  //fs.writeFile('./xp.js', 'module.exports = ' + JSON.stringify(xp), err => err?console.log(err):'')
  return res.status(200).json({status: 200, profile: xp[datas.token].find(i => i.id === datas.user)})
}
    if(datas.method === 'check'){
    if(!datas.user) return res.status(200).json({status: 401, message: 'Provide a userID'})
    if(!xp[datas.token]) xp[datas.token] = []
    let uCheck = xp[datas.token].find(i => i.id === datas.user)
    if(!uCheck) xp[datas.token].push({id: datas.user, xp: 0, level: 1, money: 0, bg: 'https://cdn.mee6.xyz/plugins/levels/cards/backgrounds/4cc81b4c-c779-4999-9be0-8a3a0a64cbaa.jpg',})
    uCheck = xp[datas.token].find(i => i.id === datas.user)
    return res.status(200).json({status: 200, profile: uCheck})
}
    if(datas.method === 'reset'){
    xp[datas.token] = []
    //fs.writeFile('./xp.js', 'module.exports = ' + JSON.stringify(xp), err => err?console.log(err):'')
    return res.status(200).json({status: 200, message: 'Reset successfully'})
    }
    /*return*/ res.status(200).json({status: 403, message: 'Provide a method.'})
})

app.get('/api/daily', (req, res) => {
const datas = req.query
if(!datas.token) return res.status(200).json({status: 401, message: 'Error! Require to provide a token.'})
if(datas.token === 'ertuapitest') return res.status(200).json({status: 403, message: 'In test API key is not allowed to run a API daily'})
if(!apikey(datas.token)) return res.status(200).json({status: 403, message: 'Error! Token is not vadilate'})
if(!datas.user) return res.status(200).json({status: 401, message: 'Provide a userID'})
if(!dailies[datas.token]) dailies[datas.token] = []
let dCheck = dailies[datas.token].find(i => i.id === datas.user)
if(!dCheck) dailies[datas.token].push({id: datas.user, dailied: 0})
if(dCheck && dCheck.dailied === 1 && dCheck.endTime - Date.now() <= 0) {
dailies[datas.token][dailies[datas.token].findIndex(i => i.id === datas.user)] = {id: datas.user, dailied: 0}
}
dCheck = dailies[datas.token].find(i => i.id === datas.user)
if(datas.method === 'info') {
return res.status(200).json({status: 200, dailyInfo: dCheck, left: dCheck.dailied === 1?dCheck.endTime - Date.now(): undefined})
}
if(datas.method === 'set') {
let str
if(!datas.time) str = '24h'
else str = datas.time
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

app.get('/api/test', (req, res) => {
  res.set('x-powered-by', 'Ertu#2715')
  res.status(200).json({headers: req.headers})
})

app.get('/api/ping', (req, res) => {
  res.status(200).json({message: 'Pong!', ts: Date.now()})
})

app.use('/api/v2', require('./v2/index'))

//Установка стилей
app.use(express.static(__dirname + '/public'));
//<link rel="stylesheet" type="text/css" href="css/style.css" />


app.listen(8080, function() {console.log('Ertu DataCenter is working!!!')})
console.log(`
|MEMES:
|TOTAL: ${memes.length}
|ALLOWED: ${memes.filter(x => x.allowed === true).length}
|DENY: ${memes.filter(x => x.allowed === false).length}
|UNDEFINED: ${memes.filter(x => x.allowed !== true && x.allowed !== false).length}
`)