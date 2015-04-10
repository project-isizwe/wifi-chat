define(function(require) {

    'use strict';
  
    var Channel  = require('app/models/Channel')
      , log      = require('app/utils/bows.min')('Models:User')
      , socket   = require('app/utils/socket')

    return Channel.extend({

      initialize: function() {
        this.on('change:node', function() {
          this.getDetails()
        }, this)
      }
      
    })

})
