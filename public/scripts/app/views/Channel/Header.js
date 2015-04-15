define(function(require) {

    'use strict';

    var _      = require('underscore')
      , Base   = require('app/views/Base')
      , log    = require('bows.min')('Views:Channel:Header')
      , Avatar = require('app/models/Avatar')

    return Base.extend({

	    template: _.template(require('text!tpl/Channel/Header.html')),
	  
	    requiresLogin: true,

      tagName: 'header',

      className: 'channel-header',

      events: {
        'click .js-newTopic': 'showNewTopicScreen',
      },

	    initialize: function(options) {
        _.bindAll(this, 'render')

        this.router = options.router
        this.options = options
      },

      render: function() {
        this.$el.html(this.template(_.extend(this.model.attributes, {
          avatarUrl: this.avatar && this.avatar.get('url'),
          bannerBackground: this.avatar && this.detectBackgroundColor()
        })))

        if(!this.avatar)
          this.loadAvatar()

        return this
      },

      loadAvatar: function() {
        this.avatar = new Avatar({ 
          jid: this.options.channelJid,
          height: 160,
          width: 'auto'
         })
        this.avatar.once('loaded:avatar', this.showAvatar, this)
      },

      showAvatar: function() {
        this.$el.find('.channel-banner')
          .css({
            backgroundImage: 'url("' + this.avatar.get('url') + '")',
            backgroundColor: this.detectBackgroundColor()
          })       
      },

      detectBackgroundColor: function() {
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
