define(function(require) {

    'use strict';
  
    var MessageModel = require('app/models/modal/Base')

    return MessageModel.extend({
      defaults: {
        type: 'spinner'
      }
    })

})
