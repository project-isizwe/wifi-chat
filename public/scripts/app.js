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
    },
    'jquery.scrollparent': {
      deps: [ 'jquery' ]
    },
    'jquery.html5-placeholder-shim': {
      deps: [ 'jquery' ]
    },
    'bows.min': {}
  }
})

// load async google maps library first 
define([ 'google-maps-loader' ], function(GoogleMapsLoader){
  GoogleMapsLoader.done(function(){
    require(['jquery', 'backbone', 'app/Router', 'fastclick'], function ($, Backbone, Router, fastclick) {

      localStorage.setItem('andlogKey', 'wifiDebug')
      
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
          Backbone.history.navigate(href.attr, { trigger: true })
        }
      })

      // clear body, add list to change background
      $('body').empty().addClass('loaded')
      
      Backbone.history.start({ pushState: true })

      fastclick.attach(document.body)
    })
  })
})