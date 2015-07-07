define(function(require) {

    'use strict';
  
    var log      = require('bows.min')('Store:Channels')
      , Channels = require('app/collections/Channels')

    return new Channels()

})