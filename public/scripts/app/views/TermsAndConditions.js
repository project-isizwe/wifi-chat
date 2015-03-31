define(function(require) {

    'use strict';

    var _           = require('underscore')
      , Base        = require('app/views/Base')
      , log         = require('app/utils/bows.min')('Views:TermsAndConditions')

    return Base.extend({

        template: _.template(require('text!tpl/TermsAndConditions.html')),
      
        requiresLogin: true,      
        termsSigned: false,
      
        title: 'Terms and Conditions', 
      
        events: {
          'click .js-terms': 'setTerms'
        },
      
        initialize: function (options) {
          this.router = options.router
          
          if (!this.router.isLoggedIn()) {
            return
          }
        },
      
        setTerms: function() {
          if (this.$el.find('.js-terms').is(':checked')) {
            this.complete()
          }
        },
      
        complete: function() {
          this.router.showChannelList()
        },
      
        render: function() {
          if (localStorage.getItem('terms')) {
            log('User has signed terms and conditions already')
            return this.complete()
          }
          this.$el.html(this.template)
          return this
        }
      
    })

})
