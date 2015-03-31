define(function(require) {

    'use strict';

    var _           = require('underscore')
      , Base        = require('app/views/Base')
      , hasTermsTpl = require('text!tpl/Discovery.html')
      , noTermsTpl  = require('text!tpl/TermsAndConditions.html')
      , socket      = require('app/utils/socket')
      , log         = require('app/utils/bows.min')('Views:Discovery')

    return Base.extend({

        requiresLogin: true,
      
        termsSigned: false,
        discovered: false,
      
        events: {
          'click .js-terms': 'setTerms'
        },
      
        initialize: function (options) {
          this.router = options.router
          
          if (!this.router.isLoggedIn()) {
            return
          }
          
          if (!localStorage.getItem('terms')) {
            this.title = 'Terms and Conditions'
            this.template = _.template(noTermsTpl)
          } else {
            this.title = 'Finding server...'
            this.template = _.template(hasTermsTpl)
            this.termsSigned = true
          }
          
          this.performDiscovery()
        },
      
        performDiscovery: function() {
          log('Performing discovery')
          var self = this
          var options = {}
          socket.send('xmpp.buddycloud.discover', options, function(error, server) {
            log('Discovery response', error, server)
            if (error) {
              return alert('ERROR', error)
            }
            self.discovered = true
            self.complete()
          })
        },
      
        setTerms: function() {
          this.termsSigned = false
          if ($(this.el).find('.js-terms').is(':checked')) {
            this.termsSigned = true
          }
          this.complete()
        },
      
        complete: function() {
          if (this.discovered && this.termsSigned) {
            this.router.showChannelList()
          }
        }
      
    })

})
