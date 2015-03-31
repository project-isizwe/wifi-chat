define(function (require) {
  
  'use strict';

  var $         = require('jquery')
    , Backbone  = require('backbone')
    , LoginView = require('app/views/Login')
    , DiscoveryView = require('app/views/Discovery')
    , log = require('app/utils/bows.min')('Router')
        
    return Backbone.Router.extend({

      el: $('body'),
      
      class: 'signup screen',
    
      loggedIn: false, 
      
      routes: {
        '': 'showHome',
        '/discovery': 'showDiscovery',
        '/channels': 'channelList',
        '/channel/:jid': 'channelContent',
        '/profile/:jid': 'userProfile'
      },
      
      showHome: function() {
        var loginView = new LoginView({ router: this })
        this.showView(loginView, '/login')
      },
      
      showDiscovery: function() {
        var discoveryView = new DiscoveryView({ router: this })
        this.showView(discoveryView, '/discovery')  
      },

      
      showView: function(view, url) {
        this.closeView()
        view.delegateEvents()
        
        if (view.title) {
          window.document.title = view.title
        }
        window.history.pushState('wifi-chat', view.title || 'Wifi-Chat', url)
        this.currentView = view
        this.el.html(view.el)
        view.render()
      },
      
      closeView: function() {
        if (!this.currentView) return
        this.currentView.stopListening()
        this.currentView.remove()
      },
      
      setLoggedIn: function() {
        this.loggedIn = true
        return this
      },
      
      isLoggedIn: function() {
        log('User is' + (this.loggedIn ? ' ' : 'n\'t ') + 'logged in')
        if (!this.loggedIn) {
          this.showHome()
        }
        return true
      }
    })

})