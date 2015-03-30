define(function(require) {

    'use strict';

    var $          = require('jquery')
      , _          = require('underscore')
      , Backbone   = require('backbone')
      , tpl        = require('text!tpl/Login.html')
      , socket     = require('app/utils/socket')
      , log        = require('app/utils/bows.min')('Views:Login')
      , template   = _.template(tpl)

    return Backbone.View.extend({

        initialize: function (options) {
            this.router = options.router
            this.render()
        },

        render: function () {
            this.$el.html(template())
            return this
        },

        events: {
            'submit': 'login'
        },

        login: function (event) {
          
            var username = $('.username').val()
            var password = $('.password').val()
            socket.send('xmpp.login', { jid: username, password: password })
            socket.on('xmpp.connection', function(data) {
              log('Connected as', data.jid)
              router.showDiscovery()
            })
            socket.on('xmpp.error', function() {
              log('Bad username / password combination')
              alert('Bad username / password combo')
            })
        }

    })

})
