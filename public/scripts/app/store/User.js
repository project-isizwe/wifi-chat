define(function(require) {

    'use strict';
  
    var log  = require('app/utils/bows.min')('Store:User')
      , User = require('app/models/User')

    return new User()

})