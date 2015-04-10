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
        log('HERE')
        this.router = options.router
        this.options = options
        _.bindAll(this, 'render')
        this.on('render', this.afterRender, this)
        this.loadAvatar()

      },

      loadAvatar: function() {
        this.avatar = new Avatar({ jid: this.options.channelJid })
        this.avatar.once('change:url', this.render, this)
        log('Avatar loaded', this.avatar.attributes)
      },

      afterRender: function() {
        log('afterRender', this.avatar.attributes)
        if (this.avatar.get('url')) {
          this.$el.find('.channelIcon')
            .css('background-image', 'url("' + this.avatar.get('url') + '")')
        }
      }

    })

})
