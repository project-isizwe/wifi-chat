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

  $(document).on('click', '.js-back', function(event) {
    event.preventDefault()
    window.history.back()
  })

  $(document).on('click', 'a:not([data-bypass])', function(event) {
    var href = { prop: $(this).prop('href'), attr: $(this).attr('href') }
    var root = location.protocol + '//' + location.host + Backbone.history.options.root

    if (href.prop && href.prop.slice(0, root.length) === root) {
      event.preventDefault()
      Backbone.history.navigate(href.attr, true)
    }
  })
  
  Backbone.history.start({ pushState: true })
  
})