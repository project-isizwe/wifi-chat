define(function(require) {

    'use strict';

    var _        = require('underscore')
      , Base     = require('app/views/Base')
      , socket   = require('app/utils/socket')
      , Avatars  = require('app/store/Avatars')
      , user     = require('app/store/User')
      , log      = require('bows.min')('Views:Settings')

    return Base.extend({

      template: _.template(require('text!tpl/Settings.html')),
    
      requiresLogin: true,

      title: 'Settings',
    
      events: {
        'click .js-logout': 'logout',
        'click .js-rules': 'showRules',
        'blur input[name="title"]': 'saveProfile',
        'blur textarea[name="description"]': 'saveProfile',
        'change input[name="avatar"]': 'uploadAvatar'
      },
    
      className: 'tab-views-item settings',

      attributes: {
        'data-view': 'settings'
      },

      initialize: function(options) {
        this.options = options
        this.router = options.router
        this.model = user

        if (window.File && window.FileReader && window.FileList && window.Blob) {
          this.model.set('canUploadFiles', true)
        } else {
          log('The File APIs are not fully supported in this browser.')
          this.model.set('canUploadFiles', false)
        }

        this.model.once('loaded:meta', this.loadAvatar, this)
        this.model.once('loaded:meta', this.render, this)
        
        if (this.model.isLoaded()) {
          this.loadAvatar()
        }

        this.on('visibilitychange', this.onVisibilityChange, this)
      },

      onVisibilityChange: function(isVisible) {
        this.$el.toggleClass('is-visible', isVisible)
      },

      render: function() {
        this.$el.html(this.template(_.extend(this.model.attributes, {
          avatarUrl: this.avatar && this.avatar.getUrl(128)
        })))

        return this
      },

      logout: function(event) {
        this.router.performLogout()
      },
    
      showRules: function() {
        this.router.showRules({ hideExtras: true })
      },

      saveProfile: function(event) {
        var title = this.$el.find('input[name="title"]').val()
        var description = this.$el.find('textarea[name="description"]').val()
        if ((this.model.get('title') === title) &&
          (this.model.get('description') === description)) {
          return
        }
        this.model.set({ title: title, description: description })
        this.model.save()
      },

      loadAvatar: function() {
        this.avatar = Avatars.getAvatar({ jid: this.model.get('channelJid') })
        this.avatar.on('change:url', this.renderAvatar, this)
        this.avatar.on('error:avatar', this.onAvatarError, this)
      },

      uploadAvatar: function(event) {
        if (!this.avatar) {
          return
        }
        if (event.target.files.length) {
          this.$el.find('.avatar').css('background-image', 'none').addClass('is-uploading')
          this.avatar.uploadAvatar(event)
        }
      },

      onAvatarError: function(message) {
        this.renderAvatar()
        this.trigger('error', message)
      },

      renderAvatar: function() {
        this.$el.find('.avatar')
          .removeClass('is-uploading')
          .css('background-image', 'url("' + this.avatar.getUrl(128) + '")')   
      }

    })

})