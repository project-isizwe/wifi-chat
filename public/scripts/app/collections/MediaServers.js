define(function(require) {

  'use strict';
  
  var Backbone    = require('backbone')
    , MediaServer = require('app/models/MediaServer')
    , log         = require('bows.min')('Collections:MediaServers')
    
  return Backbone.Collection.extend({
    
    model: MediaServer
    
  })
    
})