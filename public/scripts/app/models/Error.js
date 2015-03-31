define(function(require) {

    'use strict';
  
    var Backbone = require('backbone')

    return Backbone.Model.extend({
      message: 'error-message',
      decription: 'error-description',
      allowClose: false
    })

})
