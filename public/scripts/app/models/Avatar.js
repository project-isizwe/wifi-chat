define(function(require) {

    'use strict';
  
    var Backbone     = require('backbone')
      , mediaServers = require('app/store/MediaServers')
      , MediaServer  = require('app/models/MediaServer')
      , log          = require('app/utils/bows.min')('Models:Avatar')

    return Backbone.Model.extend({

      defaults: {
        url: null
      },

      initialize: function() {
        this.attributes.domain = this.attributes.jid.split('@')[1]
        this.mediaServer = mediaServers.findWhere({ domain: this.get('domain') })
        if (this.mediaServer) {
          if (this.mediaServer.get('url')) {
            return this.getAvatarUrl()
          }
        } else {
          this.mediaServer = new MediaServer({ domain: this.get('domain')})
          mediaServers.add(this.mediaServer)
        }
        this.mediaServer.on('change:url', this.getAvatarUrl, this)
      },

      getAvatarUrl: function() {
        var url = this.mediaServer.get('url') +
          '/' +
          this.get('jid') +
          '/avatar' +
          this.getImageParameters()
          var self = this
        setTimeout(function() { self.set('url', url) },0)
      },

      getImageParameters: function() {
        var parameters = []
        if (this.get('height')) {
          parameters.push('height=' + this.get('height'))
        }
        if (this.get('width')) {
          parameters.push('width=' + this.get('width'))
        }
        if (!parameters) {
          return ''
        }
        return '?' + parameters.join('&')
      }
      
    })

})
