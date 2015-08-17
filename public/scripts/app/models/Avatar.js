define(function(require) {

    'use strict';
  
    var Backbone     = require('backbone')
      , mediaServers = require('app/store/MediaServers')
      , MediaServer  = require('app/models/MediaServer')
      , socket       = require('app/utils/socket')
      , user         = require('app/store/User')
      , log          = require('bows.min')('Models:Avatar')
      , File         = require('app/models/File')

    return File.extend({

      defaults: {
        url: null,
        cachebust: ''
      },

      uploadToken: null,
      complete: false,

      xmppVerifyEvent: 'xmpp.buddycloud.http.verify',

      initialize: function() {
        this.discoverMediaServer()
        this.mediaServer.on('change:url', this.setAvatar, this)
      },

      setAvatar: function() {
        // check if avatar is there
        // by requesting a default sized one
        var url = this.getBaseUrl() + '?maxwidth=44&maxheight=44' + this.get('cachebust')
        this.image = new Image()
        this.image.crossOrigin = "Anonymous";
        var self = this
        this.image.onload = function() {
          self.set('url', self.getBaseUrl())
          self.complete = true
        }
        this.image.src = url
      },

      getBaseUrl: function() {
        return this.mediaServer.get('url') +
          '/' +
          this.get('jid') +
          '/avatar'
      },

      getUrl: function(width, height) {
        if (!this.get('url')) {
          return ''
        }

        if (!width) {
          width = 44
        }
        // height can be ommitted for a square size avatar
        if (!height) {
          height = width
        }

        var parameters = [
          'maxheight='+ width,
          'maxwidth='+ height
        ]
        return this.getBaseUrl() + '?' + parameters.join('&') + this.get('cachebust')
      },

    })

})
