require.config({
  baseUrl: '/scripts/lib',
  paths: {
    app: '../app',
    tpl: '../templates'
  },
  shim: {
    backbone: {
      deps: [ 'underscore', 'jquery' ],
      exports: 'Backbone'
    },
    underscore: {
      exports: '_'
    },
    'jquery.timeago': {
      deps: [ 'jquery' ]
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