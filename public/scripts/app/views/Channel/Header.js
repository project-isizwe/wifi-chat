define(function(require) {

    'use strict';

    var _       = require('underscore')
      , Base    = require('app/views/Base')
      , log     = require('bows.min')('Views:Channel:Header')
      , Avatars = require('app/store/Avatars')

    return Base.extend({

	    template: _.template(require('text!tpl/Channel/Header.html')),
	  
	    requiresLogin: true,

      tagName: 'header',

      className: 'channel-header',

      events: {
        'click .js-newTopic': 'showNewTopicScreen',
      },

      avatarSize: 160,

	    initialize: function(options) {
        _.bindAll(this, 'render')

        this.router = options.router
        this.options = options
        this.avatar = Avatars.getAvatar({ jid: this.options.channelJid })
        this.avatar.on('change:url', this.renderAvatar, this)
      },

      render: function() {
        this.$el.html(this.template(_.extend(this.model.attributes, {
          avatarUrl: this.avatar.getUrl(this.avatarSize),
          bannerBackground: this.detectBackgroundColor()
        })))

        log(this.avatar)

        return this
      },

      renderAvatar: function() {
        log(this.avatar.getUrl(this.avatarSize))
        this.$el.find('.channel-banner')
          .css({
            backgroundImage: 'url("' + this.avatar.getUrl(this.avatarSize) + '")',
            backgroundColor: this.detectBackgroundColor()
          })       
      },

      detectBackgroundColor: function() {
        if (!this.avatar.isLoaded()) {
          return
        }

        var canvas = document.createElement('canvas')
        var ctx = canvas.getContext('2d')
        canvas.width = this.avatar.image.width
        canvas.height = this.avatar.image.height
        ctx.drawImage(this.avatar.image, 0, 0)
        // if it fails, it fails because of cross-origin data. no background color then
        try {
          var topLeftPixel = ctx.getImageData(0, 0, 1, 1).data
          // can't use .join()
          return 'rgba('+ topLeftPixel[0] +','+ topLeftPixel[1] +','+ topLeftPixel[2] +','+ topLeftPixel[3] +')'
        } catch(error) {}
      },

      showNewTopicScreen: function() {
        this.router.showNewTopic(this.model.get('channelJid'))
      },

    })

})
