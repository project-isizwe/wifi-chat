define(function(require) {

    'use strict';
  
    var log          = require('bows.min')('Store:MediaServers')
      , MediaServers = require('app/collections/MediaServers')

    return new MediaServers()

})