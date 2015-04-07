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

        events: {
          'click': 'open'
        },

        initialize: function(options){
          _.bindAll(this, 'render')
          var self = this

          this.router = options.router
          this.model.bind('change', this.render)
        },

        open: function(){
          this.router.showChannel(this.model.get('channelJid'))
        }
    })

})
