define(function(require) {

    'use strict';

    var _              = require('underscore')
      , Base           = require('app/views/Base')
      , socket         = require('app/utils/socket')
      , log            = require('app/utils/bows.min')('Views:ChannelList')
      , Avatar         = require('app/models/Avatar')

    return Base.extend({

        template: _.template(require('text!tpl/ChannelListItem.html')),
      
        requiresLogin: true,
      
        className: 'channelList-item',

        events: {
          'click': 'open'
        },

        initialize: function(options) {
          var self = this

          this.router = options.router
          this.model.bind('change', this.render, this)
          this.model.bind('change:channelJid', this.loadAvatar, this)

          _.bindAll(this, 'render')
          this.on('render', this.afterRender, this)
        },

        open: function(){
          this.router.showChannel(this.model.get('channelJid'))
        },

        loadAvatar: function() {
          this.avatar = new Avatar({
            jid: this.model.get('channelJid'),
            height: 44,
            width: 44
          })
          this.avatar.once('change:url', this.render, this)
        },

        afterRender: function() {
          if (!this.avatar || !this.avatar.get('url')) {
            return
          }
          var image = new Image()
          var self = this
          image.onerror = function() {
            self.$el.find('.channelIcon')
              .css('background-image', 'url(../images/icons/channel_placeholder.svg)')
          }
          image.src = this.avatar.get('url')
          this.$el.find('.channelIcon')
            .css('background-image', 'url("' + this.avatar.get('url') + '")')
        }
    })

})
