define(function(require) {

    'use strict';
  
    var log           = require('app/utils/bows.min')('Store:Subscriptions')
      , Subscriptions = require('app/collections/Subscriptions')

    return new Subscriptions()

})