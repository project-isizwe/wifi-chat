define(function(require) {

    'use strict';

    var _              = require('underscore')
      , Base           = require('app/views/Base')
      , log            = require('app/utils/bows.min')('Views:Channels:NoChannels')

    return Base.extend({

        template: _.template(require('text!tpl/Channels/NoChannels.html')),
      
        requiresLogin: false
      
    })

})
