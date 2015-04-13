define(function(require) {

    'use strict';
  
    var log    = require('bows.min')('Store:Pusher')
      , Pusher = require('app/utils/Pusher')

    return new Pusher()

})