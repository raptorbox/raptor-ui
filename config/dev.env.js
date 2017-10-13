var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

var url = 'http://raptor.local'
var urlPro = 'https://api.raptorbox.eu'
module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  RAPTOR: `{
      "url": "http://raptor.local",
      "username": "memosa",
      "password": "memosa.EIT2017",
  }`
})
