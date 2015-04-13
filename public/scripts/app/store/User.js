define(function(require) {

    'use strict';
  
    var log  = require('bows.min')('Store:User')
      , User = require('app/models/User')

    return new User()

})