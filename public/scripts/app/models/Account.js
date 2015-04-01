define(function(require) {

    'use strict';
  
    var Backbone = require('backbone')
      , _        = require('underscore')
      , log      = require('app/utils/bows.min')('Models:Channel')
      , socket   = require('app/utils/socket')

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
