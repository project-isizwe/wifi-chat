define(function (require) {
  
  'use strict';

  var $                 = require('jquery')
    , Backbone          = require('backbone')
    , LoginView         = require('app/views/Login')
    , RulesView         = require('app/views/Rules')
    , SignupView        = require('app/views/Signup')
    , PasswordResetView = require('app/views/PasswordReset')
    , ChannelListView   = require('app/views/ChannelList')
    , ModalView         = require('app/views/Modal')
    , log               = require('app/utils/bows.min')('Router')
        
    return Backbone.Router.extend({

      el: $('body'),
      
      class: 'signup screen',
    
      loggedIn: false, 
      
      routes: {
        '': 'showChannelList',
        'login': 'showLogin',
        'signup': 'showSignup',
        'password/reset': 'showPasswordReset',
        'rules': 'showRules',
        'channel/:jid': 'channelContent',
        'profile/:jid': 'userProfile',
        'channels': 'showChannelList'
        
      },
      
      initialize: function() {
        log('Application initialized')
      },
      
      showModal: function() {
        var modalView = new ModalView({ router: this })
        this.showView(modalView, '/modal')
      },
      
      showLogin: function() {
        var loginView = new LoginView({ router: this })
        this.showView(loginView, '/login')
      },
      
      showRules: function() {
        var rulesView = new RulesView({ router: this })
        this.showView(rulesView, '/rules')  
      },
      
      showSignup: function() {
        var signupView = new SignupView({ router: this })
        this.showView(signupView, '/signup')
      },

      showPasswordReset: function() {
        var passwordResetView = new PasswordResetView({ router: this })
        this.showView(passwordResetView, '/password/reset')
      },
      
      showChannelList: function() {
        var channelList = new ChannelListView({ router: this })
        this.showView(channelList, '/')
      },
      
      showView: function(view, url) {
        this.closeView()
        view.delegateEvents()

        window.document.title = view.title
        if (view.requiresLogin && !this.loggedIn) {
          return this.showLogin()
        }
        this.navigate(url, { trigger: true })
        this.currentView = view

        this.el.html(view.el)
        view.delegateEvents()
        view.render()
      },
      
      closeView: function() {
        if (!this.currentView) return
        this.currentView.closeView()
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