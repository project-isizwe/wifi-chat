define(function(require) {

    'use strict';
  
    var Backbone     = require('backbone')
      , mediaServers = require('app/store/MediaServers')
      , MediaServer  = require('app/models/MediaServer')
      , socket       = require('app/utils/socket')
      , user         = require('app/store/User')
      , log          = require('bows.min')('Models:File')

    return Backbone.Model.extend({

      method: 'POST',

      defaults: {
        url: null,
        cachebust: ''
      },

      uploadToken: null,
      complete: false,

      xmppVerifyEvent: 'xmpp.buddycloud.http.verify',

      initialize: function(attributes) {
        if (attributes) {
          this.attributes = attributes
        }
        this.discoverMediaServer()
      },

      discoverMediaServer: function(callback) {
        this.attributes.domain = this.attributes.jid.split('@')[1]
        this.mediaServer = mediaServers.findWhere({ domain: this.get('domain') })
        if (this.mediaServer) {
          if (this.mediaServer.get('url')) {
            if (callback) return callback()
          }
        } else {
          this.mediaServer = new MediaServer({ domain: this.get('domain')})
          mediaServers.add(this.mediaServer)
        }
      },

      isLoaded: function() {
        return this.complete
      },

      verifyFileUpload: function(data) {
        var event = 'xmpp.buddycloud.http.confirm'
        if (this.uploadToken !== data.request.id) {
          event = 'xmpp.buddycloud.http.deny'
        }
        this.uploadToken = null
        log('Have file upload token, sending', event)
        socket.send(
          event,
          this.getVerificationPayload(data),
          function(error, data) { log(error, data) }
        )
      },

      getVerificationPayload: function(data) {
        return { 
          to: data.from.domain,
          id: data.id,
          request: data.request,
          type: data.type
        }
      },

      getBaseUrl: function() {
        return this.baseUrl = this.mediaServer.get('url') +
          '/' +
          this.get('jid')
      },

      upload: function(event, callback) {
        socket.once(this.xmppVerifyEvent, this.verifyFileUpload, this)

        var formData = new FormData()
        var file
        if (event.target.files) {
          file = event.target.files[0]
        } else {
          for (var i = 0; i < event.target.length; i++) {
            var t = event.target[i]
            if (t.files && t.files[0]) {
              file = t.files[0]
            }
          }
        }

        if (!file) return callback()

        var reader = new FileReader()
        var self = this

        reader.onload = function(event) {
          var fileData = event.target.result
          formData.append('data', file)
          formData.append('content-type', file.type)
          formData.append('filename', file.name)

          var ajaxOpts = {
            url: self.getBaseUrl(),
            type: self.method,
            headers: {
              'Authorization':'Basic ' + self.getAuthorizationToken(),
            },
            cache: false,
            contentType: false,
            processData: false,
            success: function(data, status, jqXHR) {
              log('success', data, status, jqXHR)
              self.set('cachebust', '&' + Date.now())
              self.trigger('change:url', self, self.get('url'))
              self.trigger('change:id', self, { url: self.get('url'), id: data.id })
            },
            error: function(jqXHR, status, error) {
              self.trigger('error:file', 'Something went wrong. Please try again later.')
              log('error', {
                  status: status,
                  error: error,
                  xhr: jqXHR
              })
            }
          }
          ajaxOpts.data = formData
          $.ajax(ajaxOpts)
        }
        reader.readAsText(file)
      },

      getAuthorizationToken: function() {
        var token = user.get('fullJid') + ':' + this.generateUploadToken()
        return btoa(token)
      },

      generateUploadToken: function() {
        this.uploadToken = Math.random().toString(36).substring(7)
        return this.uploadToken
      },
      
    })

})
