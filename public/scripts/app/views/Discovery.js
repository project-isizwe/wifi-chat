define(function(require) {

    'use strict';

    var _           = require('underscore')
      , Backbone    = require('backbone')
      , hasTermsTpl = require('text!tpl/Discovery.html')
      , noTermsTpl  = require('text!tpl/TermsAndConditions.html')
      , socket      = require('app/utils/socket')
      , log         = require('app/utils/bows.min')('Views:Discovery')

    return Backbone.View.extend({

        initialize: function (options) {
          this.router = options.router
          if (!localStorage.getItem('terms')) {
            this.title = 'Terms and Conditions'
            this.template = _.template(noTermsTpl)
          } else {
            this.title = 'Finding server...'
            this.template = _.template(hasTermsTpl)
          }
          if (this.router.isLoggedIn()) {
            this.performDiscovery()
            this.render()
          }
        },
      
        performDiscovery: function() {
          log('Performing discovery')
          var self = this
          socket.send('xmpp.buddycloud.discover', function(error, server) {
            log('Discovery response', error, server)
            if (error) {
              return alert('ERROR', error)
            }
            self.options.router.showFeed()
          })
        },

        render: function () {
            this.$el.html(this.template())
            return this
        },

    })

})
