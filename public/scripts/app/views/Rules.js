define(function(require) {

    'use strict';

    var _           = require('underscore')
      , Base        = require('app/views/Base')
      , log         = require('app/utils/bows.min')('Views:Rules')

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
        },
      
        complete: function() {
          this.router.showChannelList()
        },
      
        render: function() {
          this.$el.html(this.template)
          return this
        }
      
    })

})
