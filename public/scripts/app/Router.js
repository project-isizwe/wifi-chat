define(function (require) {
  
  'use strict';

  var $         = require('jquery')
    , Backbone  = require('backbone')
    , LoginView = require('app/views/Login')
    , DiscoveryView = require('app/views/Discovery')
    , SignupView = require('app/views/Signup')
    , ChannelListView = require('app/views/ChannelList')
    , log = require('app/utils/bows.min')('Router')
        
    return Backbone.Router.extend({

      el: $('body'),
      
      class: 'signup screen',
    
      loggedIn: false, 
      
      routes: {
        '': 'channelList',
        '/login': 'showLogin',
        '/signup': 'showSignup',
        '/discovery': 'showDiscovery',
        '/channel/:jid': 'channelContent',
        '/profile/:jid': 'userProfile'
      },
      
      showLogin: function() {
        var loginView = new LoginView({ router: this })
        this.showView(loginView, '/login')
      },
      
      showDiscovery: function() {
        var discoveryView = new DiscoveryView({ router: this })
        this.showView(discoveryView, '/discovery')  
      },
      
      showSignup: function() {
        var signupView = new SignupView({ router: this })
        this.showView(signupView, '/signup')
      },
      
      channelList: function() {
        var channelList = new ChannelListView({ router: this })
        this.showView(channelList, '/')
      },
      
      showView: function(view, url) {
        this.closeView()
        view.delegateEvents()
        
        if (view.title) {
          window.document.title = view.title
        }
        window.history.pushState('wifi-chat', view.title || 'Wifi-Chat', url)
        if (view.requiresLogin && !this.loggedIn) {
          return this.showLogin()
        }
        this.currentView = view
        this.el.html(view.el)
        view.registerEvents()
        log('Rendering')
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
          this.showLogin()
        }
        return true
      }
    })

})