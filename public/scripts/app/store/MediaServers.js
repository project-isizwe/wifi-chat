define(function(require) {

    'use strict';
  
    var log          = require('app/utils/bows.min')('Store:MediaServers')
      , MediaServers = require('app/collections/MediaServers')

    return new MediaServers()

})