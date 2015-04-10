define(function(require) {

    'use strict';

    var _      = require('underscore')
      , Base   = require('app/views/Base')
      , log    = require('app/utils/bows.min')('Views:Channel:Header')
      , Avatar = require('app/models/Avatar')

    return Base.extend({

	    template: _.template(require('text!tpl/Channel/Header.html')),
	  
	    requiresLogin: true,

	    initialize: function(options) {
        this.router = options.router
        this.options = options
        _.bindAll(this, 'render')
        this.on('render', this.afterRender, this)
        this.loadAvatar()
      },

      loadAvatar: function() {
        this.avatar = new Avatar({ jid: this.options.channelJid })
        this.avatar.once('loaded:avatar', this.render, this)
      },

      afterRender: function() {
        if (this.avatar.get('url')) {
          this.$el.find('.channel-banner')
            .css('background-image', 'url("' + this.avatar.get('url') + '")')
        }          
      }

    })

})
