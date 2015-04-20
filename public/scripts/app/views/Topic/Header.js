define(function(require) {

    'use strict';

    var _        = require('underscore')
      , Avatars  = require('app/store/Avatars')
      , Base     = require('app/views/Base')
      , Post     = require('app/models/Post')
      , log      = require('bows.min')('Views:Channel:Header')

    return Base.extend({

        template: _.template(require('text!tpl/Empty.html')),
        postTemplate: _.template(require('text!tpl/Topic/Header.html')),

        requiresLogin: true,

        canRender: false,

        events: {
          'click .js-seeAuthor': 'seeAuthor',
        },

        initialize: function(options) {
        	this.options = options
        	this.router = options.router
        	this.model = new Post({
        		node: this.options.node,
        		localId: this.options.localId
        	})
        	this.model.once('loaded:post', this.renderPost, this)
        	this.model.sync()
        },

        renderPost: function() {
          this.template = this.postTemplate
          this.loadAvatar()
        	this.render()
        },

        render: function() {
        	this.beforeRender()
          this.$el.html(this.template(_.extend(this.model.attributes, {
            avatarUrl: this.avatar && this.avatar.getUrl(),
          })))
          this.$el.find('time').timeago()
	        this.trigger('render')
	        return this
        },

        seeAuthor: function() {
          this.options.router.showProfile(this.model.get('authorJid'))
        },
        
        loadAvatar: function() {
          this.avatar = Avatars.getAvatar({ jid: this.model.get('authorJid') })
          this.avatar.on('change:url', this.renderAvatar, this)
        },

        renderAvatar: function() {
          this.$el.find('.avatar')
            .css('background-image', 'url("' + this.avatar.getUrl() + '")')      
        },

    })

})
