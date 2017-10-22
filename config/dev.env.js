var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

var url = 'http://raptor.local'
var urlPro = 'http://api.raptorbox.eu'
module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  RAPTOR: `{
      "url": "http://raptorbox.ddns.net",
      "username": "memosa",
      "password": "memosa.EIT2017",
  }`
})
