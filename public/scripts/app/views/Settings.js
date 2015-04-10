define(function(require) {

    'use strict';

    var _       = require('underscore')
      , Base    = require('app/views/Base')
      , socket  = require('app/utils/socket')
      , Avatar  = require('app/models/Avatar')
      , user    = require('app/store/User')
      , log     = require('app/utils/bows.min')('Views:Settings')

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

        this.model.once('loaded:meta', this.render, this)
        this.loadAvatar()
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
        this.avatar = new Avatar({ jid: this.model.get('channelJid') })
        this.avatar.once('loaded:avatar', this.render, this)
      },

      afterRender: function() {
        if (this.avatar.get('url')) {
          this.$el.find('.js-avatar')
            .css('background-image', 'url("' + this.avatar.get('url') + '")')
        }          
      },

      uploadAvatar: function(event) {
        this.avatar.uploadAvatar(event)
        this.avatar.once('avatar:updated', this.afterRender, this)
      }

    })

})
