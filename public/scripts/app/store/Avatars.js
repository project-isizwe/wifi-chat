define(function(require) {

    'use strict';
  
    var log           = require('bows.min')('Store:Avatars')
      , Avatars = require('app/collections/Avatars')

    return new Avatars()

})