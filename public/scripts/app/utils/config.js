define(function(require) {

    var log = require('bows.min')('Utils:Config')

    'use strict';

    if (window.config) {
      try {
        return JSON.parse(window.config)
      } catch (e) {
        log('Illegal frontend configuration provided')
        return {}
      }
    }
    return {}

})
