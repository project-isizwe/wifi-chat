define(function(require) {

    'use strict';
  
    var Backbone = require('backbone')
      , log      = require('bows.min')('Models:NewPassword')

    return Backbone.Model.extend({
      
      urlRoot: '/account/reset',
      
      defaults: {
        password: null
      }
      
    })

})
