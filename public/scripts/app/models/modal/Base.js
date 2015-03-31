define(function(require) {

    'use strict';
  
    var Backbone = require('backbone')

    return Backbone.Model.extend({
      defaults: {
        type: 'base',
        message: 'Error',
        showClose: false
      }
    })

})
