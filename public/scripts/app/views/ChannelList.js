define(function(require) {

    'use strict';

    var _        = require('underscore')
      , Base     = require('app/views/Base')
      , socket   = require('app/utils/socket')
      , log     = require('app/utils/bows.min')('Views:ChannelList')

    return Base.extend({

        template: _.template(require('text!tpl/ChannelList.html')),
        requiresLogin: true,
      
        className: 'channels screen'      
    })

})
