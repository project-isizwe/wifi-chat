define(function(require) {

    'use strict';
  
    var MessageModal = require('app/models/modal/Base')

    return MessageModel.extend({
      defaults: {
        type: 'error',
        message: 'error-message',
        decription: 'error-description',
        showClose: false
      }
    })

})
