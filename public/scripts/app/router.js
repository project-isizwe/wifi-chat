define(function (require) {
  
  'use strict';

  var $         = require('jquery')
    , Backbone  = require('backbone')
    , LoginView = require('app/views/Login')
    , DiscoveryView = require('app/views/Discovery')
    , PageSlider  = require('app/utils/pageslider')
    , slider = new PageSlider($('body'))
        
    return Backbone.Router.extend({

      routes: {
        '': 'showHome',
        'discovery': 'showDiscovery',
        'channels': 'channelList',
        'channel/:jid': 'channelContent',
        'profile/:jid': 'userProfile'
      },
      
      showHome: function () {
        var loginView = new LoginView({ router: this })
        this.showView(loginView)
      },
      
      showDiscovery: function() {
        var discoveryView = new DiscoveryView({ router: this })
        this.showView(discoveryView)  
      },

      
      showView: function(view) {
        this.closeView()
        view.delegateEvents()
        slider.slidePage(view.$el)
        this.currentView = view
      },
      
      closeView: function() {
        if (!this.currentView) return
        this.currentView.stopListening()
        this.currentView.remove()
      }
    })

})