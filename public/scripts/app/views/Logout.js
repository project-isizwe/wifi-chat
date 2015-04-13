define(function(require) {

    'use strict';

    var _      = require('underscore')
      , Base   = require('app/views/Base')
      , socket = require('app/utils/socket')
      , log    = require('bows.min')('Views:Logout')

    return Base.extend({

        requiresLogin: false,

        render: function() {
          /* noop function keeps the socket alive */
          socket.send('xmpp.logout', {}, function() {})
          localStorage.removeItem('jid')
          localStorage.removeItem('password')
          localStorage.removeItem('channel-server')
          this.router.showLogin()
          return this
        }

    })

})
