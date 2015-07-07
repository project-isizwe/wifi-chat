define(function(require) {

    'use strict';

    var _                   = require('underscore')
      , Base                = require('app/views/Base')
      , Avatars             = require('app/store/Avatars')
      , ChannelModel        = require('app/models/Channel')
      , log                 = require('bows.min')('Views:Profile')

    require('jquery.timeago')

    return Base.extend({
        template: _.template(require('text!tpl/Profile.html')),
      
        requiresLogin: true,
      
        className: 'profile screen',

        initialize: function(options){
          _.bindAll(this, 'render')

          this.model = new ChannelModel({ node: '/user/' + options.jid + '/posts' })
          this.model.bind('loaded:meta', this.render, this)

          this.avatar = Avatars.getAvatar({ jid: options.jid })
          log(options.jid, this.avatar, Avatars)
          this.avatar.on('change:url', this.renderAvatar, this)
        },

        render: function() {
          this.$el.html(this.template(_.extend(this.model.attributes, {
            avatarUrl: this.avatar.getUrl(128),
          })))
          this.$el.find('time').timeago()
          return this
        },

        renderAvatar: function() {
          this.$el.find('.avatar')
            .css('background-image', 'url("' + this.avatar.getUrl(128) + '")')      
        },

    })

})
