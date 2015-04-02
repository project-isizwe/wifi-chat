define(function(require) {

    'use strict';

    var _              = require('underscore')
      , Base           = require('app/views/Base')
      , socket         = require('app/utils/socket')
      , log            = require('app/utils/bows.min')('Views:ChannelList')

    return Base.extend({

        template: _.template(require('text!tpl/ChannelListItem.html')),
      
        requiresLogin: true,
      
        className: 'channelList-item',

        initialize: function(options){
          _.bindAll(this, 'render')
          this.model.bind('change', this.render)
        },
    })

})
