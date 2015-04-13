define(function(require) {

    'use strict';
  
    var log           = require('bows.min')('Store:Subscriptions')
      , Subscriptions = require('app/collections/Subscriptions')

    return new Subscriptions()

})