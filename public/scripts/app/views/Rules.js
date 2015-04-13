define(function(require) {

    'use strict';

    var _           = require('underscore')
      , Base        = require('app/views/Base')
      , Rules       = require('app/models/Rules')
      , log         = require('bows.min')('Views:Rules')

    return Base.extend({

        template: _.template(require('text!tpl/Rules.html')),
      
        requiresLogin: true,      
        termsSigned: false,
      
        title: 'Rules', 
      
        events: {
          'click .js-signRules': 'complete'
        },

        className: 'rules screen',
      
        initialize: function (options) {
          this.router = options.router
          
          if (!this.router.isLoggedIn()) {
            return
          }
          
          this.model = new Rules({
            hideExtras: options.hideExtras
          })
        },
      
        complete: function() {
          this.router.showHome()
        }
      
    })

})
