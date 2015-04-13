define(function(require) {

    'use strict';
  
    var Backbone = require('backbone')
      , log      = require('bows.min')('Models:Account')

    return Backbone.Model.extend({
      
      urlRoot: '/account',
      
      defaults: {
        local: null,
        domain: null,
        email: null,
        password: null
      }
      
    })

})
