require.config({
  baseUrl: 'scripts/lib',
  paths: {
    app: '../app',
    tpl: '../templates'
  },
  map: {
    '*': {
      'app/models/employee': 'app/models/memory/employee'
    }
  },
  shim: {
    backbone: {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    },
    underscore: {
      exports: '_'
    }
  }
})

require(['jquery', 'backbone', 'app/Router'], function ($, Backbone, Router) {

  localStorage.andlogKey = 'wifiDebug'
  
  var router = new Router()

  $('body').on('click', '.js-back', function(event) {
    event.preventDefault()
    window.history.back()
  })
  
  Backbone.history.start({ pushState: true })
  
})