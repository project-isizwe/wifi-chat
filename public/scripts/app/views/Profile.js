define(function(require) {

    'use strict';

    var _                   = require('underscore')
      , Base                = require('app/views/Base')
      , Avatar              = require('app/models/Avatar')
      , ChannelModel        = require('app/models/Channel')
      , log                 = require('bows.min')('Views:Profile')

    require('jquery.timeago')

    return Base.extend({

        template: _.template(require('text!tpl/ProfileEmpty.html')),
        profileTemplate: _.template(require('text!tpl/Profile.html')),
      
        requiresLogin: true,
      
        className: 'profile screen',

        initialize: function(options){
          _.bindAll(this, 'render')

          this.model = new ChannelModel({ node: '/user/' + options.jid + '/posts' })
          this.model.bind('loaded:meta', this.displayProfile, this)
        },

        displayProfile: function() {
          if (!this.avatar) {
            this.loadAvatar()
          }

          this.$el.html(this.profileTemplate(this.model.attributes))
          this.$el.find('time').timeago()
        },

        loadAvatar: function() {
          this.avatar = new Avatar({ 
            jid: this.model.get('channelJid'),
            width: 128,
            height: 128
          })
          this.avatar.once('loaded:avatar', this.showAvatar, this)
        },

        showAvatar: function() {
          this.$el.find('.avatar')
            .css('background-image', 'url("' + this.avatar.get('url') + '")')      
        },

    })

})
