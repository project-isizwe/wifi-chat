define(function(require) {

    'use strict';

    var _                = require('underscore')
      , Base             = require('app/views/Base')

    return Base.extend({

      template: _.template(require('text!tpl/Report/Thankyou.html')),

      requiresLogin: true,

      title: 'Report sent!',

      className: 'report screen',

      events: {
        'click .js-finish': 'finish'
      },

      finish: function() {
        this.router.showHome()
      }

    })

})
