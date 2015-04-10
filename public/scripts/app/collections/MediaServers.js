define(function(require) {

  'use strict';
  
  var Backbone    = require('backbone')
    , MediaServer = require('app/models/MediaServer')
    , log         = require('app/utils/bows.min')('Collections:MediaServers')
    
  return Backbone.Collection.extend({
    
    model: MediaServer
    
  })
    
})