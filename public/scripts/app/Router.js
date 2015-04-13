define(function (require) {
  
  'use strict';

  var $                 = require('jquery')
    , Backbone          = require('backbone')
    , WelcomeView       = require('app/views/Welcome')
    , LoginView         = require('app/views/Login')
    , RulesView         = require('app/views/Rules')
    , SignupView        = require('app/views/Signup')
    , PasswordResetView = require('app/views/PasswordReset')
    , NewPasswordView   = require('app/views/NewPassword')
    , LogoutView        = require('app/views/Logout')
    , HomeView          = require('app/views/Home')
    , ModalView         = require('app/views/Modal')
    , ChannelView       = require('app/views/Channel/Index')
    , ProfileView       = require('app/views/Profile')
    , TopicView         = require('app/views/Topic/Index')
    , user              = require('app/store/User')
    , log               = require('app/utils/bows.min')('Router')
        
    return Backbone.Router.extend({

      el: $('body'),
    
      loggedIn: false, 
      
      routes: {
        '': 'showHome',
        'welcome': 'showWelcome',
        'login': 'showLogin',
        'signup': 'showSignup',
        'password/reset': 'showPasswordReset',
        'password/reset/:token': 'showNewPassword',
        'rules': 'showRules',
        'profile/:jid': 'showProfile',
        'channel/:jid': 'showChannel',
        'channel/:jid/*id': 'showTopic',
        'logout': 'showLogout'
      },
      
      initialize: function() {
        log('Application initialized')
        this.on('all', function(route, parameters) {
          if (0 !== route.indexOf('route:')) {
            return
          }
          var method = route.split(':')[1]
          if ('showLogin' === method) {
            return this.lastRoute = null
          }
          this.lastRoute = {
            method: route.split(':')[1],
            parameters: parameters
          }
        }, this)
      },
      
      showModal: function() {
        var modalView = new ModalView({ router: this })
        this.showView(modalView, '/modal')
      },

      showWelcome: function(options) {
        var welcomeView = new WelcomeView()
        this.showView(welcomeView, '/welcome') 
      },
      
      showLogin: function(options) {
        if (!options) {
          options = {}
        }
        var loginView = new LoginView({
          router: this,
          jid: options.jid,
          password: options.password,
          lastRoute: this.lastRoute,
          showRules: options.showRules
        })
        this.showView(loginView, '/login')
      },
      
      showRules: function(options) {
        var rulesView = new RulesView({
          router: this,
          hideExtras: (options || {}).hideExtras
        })
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
      
      showNewPassword: function(token) {
        var newPasswordView = new NewPasswordView({ router: this, token: token })
        this.showView(newPasswordView, '/password/reset/' + token)
      },
      
      showHome: function() {
        var homeView = new HomeView({ router: this })
        this.showView(homeView, '')
      },

      showChannel: function(jid) {
        var channelView = new ChannelView({ router: this, channelJid: jid })
        this.showView(channelView, '/channel/' + jid)
      },

      showTopic: function(jid, id, goToNewComment) {
        if (!id) {
          return this.showChannel(jid)
        }
        var topicView = new TopicView({ router: this, channelJid: jid, id: id, goToNewComment: goToNewComment })
        this.showView(topicView, '/channel/' + jid + '/' + id)
      },

      showProfile: function(jid) {
        var profileView = new ProfileView({ router: this, jid: jid })
        this.showView(profileView, '/profile/' + jid)
      },
      
      performLogout: function() {
        localStorage.setItem('wasLoggedInOnce', true)
        var logoutView = new LogoutView({ router: this })
        this.showView(logoutView, '/logout')
      },
      
      showView: function(view, url) {
        this.closeView()
        view.delegateEvents()

        if (view.requiresLogin && !this.loggedIn) {
          return this.sendToLogin()
        }
        window.document.title = 'WiFi Chat - ' + view.title
        this.navigate(url, { trigger: false })
        this.currentView = view

        this.el.html(view.el)
        view.delegateEvents()

        if(!view.noAutoRender)
          view.render()
      },
      
      closeView: function() {
        if (!this.currentView) return
        this.currentView.closeView()
      },
      
      setLoggedIn: function(jid) {
        this.loggedIn = jid
        var jidString = jid.local + '@' + jid.domain
        var node = [ '/user/', jidString, '/posts' ]
        user.set({
          node: node.join(''),
          channelJid: jidString,
          fullJid: jidString + '/' + jid.resource
        })
        return this
      },
      
      getJid: function() {
        return this.loggedIn
      }, 

      sendToLogin: function() {
        if (localStorage.getItem('wasLoggedInOnce')) {
          return this.showLogin()
        }
        this.showWelcome()
      },     
      
      isLoggedIn: function() {
        log('User is' + (this.loggedIn ? ' ' : 'n\'t ') + 'logged in')
        if (!this.loggedIn) {
          this.sendToLogin()
        }
        return true
      }
    })

})