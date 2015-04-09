define(function(require) {

    'use strict';

    var _                   = require('underscore')
      , Base                = require('app/views/Base')
      , socket              = require('app/utils/socket')
      , log                 = require('app/utils/bows.min')('Views:Settings')

    return Base.extend({

        template: _.template(require('text!tpl/Settings.html')),
      
        requiresLogin: true,

        title: 'Settings',
      
        events: {
          'click .js-logout': 'logout',
          'click .js-rules': 'showRules',
          'blur input[name="name"]': 'storeName',
          'blur textarea': 'storeDescription'
        },
      
        className: 'tab-views-item settings',

        attributes: {
          'data-view': 'settings'
        },
      
        logout: function(event) {
          this.router.performLogout()
        },
      
        showRules: function() {
          this.router.showRules(true)
        },

        storeName: function(event) {
          // socket send 
          // event.currentTarget.value
        },

        storeDescription: function(event) {
          // socket send 
          // event.currentTarget.value

          // no auto-grow textarea in v1
        }
    })

})
