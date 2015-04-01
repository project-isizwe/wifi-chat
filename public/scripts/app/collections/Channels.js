define(function(require) {

  'use strict';
  
  var Backbone = require('backbone')
    , Channel = require('app/models/Channel')
    
  return Backbone.Collection.extend({
    model: Channel
  })
    
})