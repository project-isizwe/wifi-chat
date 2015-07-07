define(function(require) {

    'use strict';

    var _              = require('underscore')
      , Base           = require('app/views/Base')
      , socket         = require('app/utils/socket')
      , log            = require('bows.min')('Views:ChannelList')
      , Avatars        = require('app/store/Avatars')

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

          if (this.model.get('channelJid')) {
            this.loadAvatar()
          } else {
            this.model.once('change:channelJid', this.loadAvatar, this)
          }
        },

        open: function(){
          this.router.showChannel(this.model.get('channelJid'))
        },

        render: function(){
          this.$el.html(this.template(_.extend(this.model.attributes, {
            avatarUrl: this.avatar && this.avatar.getUrl()
          })))
          return this
        },

        loadAvatar: function() {
          if (!this.model.get('channelJid')) {
            return
          }
          this.avatar = Avatars.getAvatar({ jid: this.model.get('channelJid') })
          this.avatar.on('change:url', this.renderAvatar, this)
        },

        renderAvatar: function() {
          this.$el.find('.channelIcon')
            .css('background-image', 'url("' + this.avatar.getUrl() + '")')
        }
    })

})
