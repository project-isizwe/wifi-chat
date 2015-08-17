define(function(require) {

    'use strict';
  
    var Backbone     = require('backbone')
      , mediaServers = require('app/store/MediaServers')
      , MediaServer  = require('app/models/MediaServer')
      , socket       = require('app/utils/socket')
      , user         = require('app/store/User')
      , log          = require('bows.min')('Models:File')

    return Backbone.Model.extend({

      defaults: {
        url: null,
        cachebust: ''
      },

      uploadToken: null,
      complete: false,

      xmppVerifyEvent: 'xmpp.buddycloud.http.verify',

      initialize: function() {
        this.discoverMediaServer()
      },

      discoverMediaServer: function() {
        this.attributes.domain = this.attributes.jid.split('@')[1]
        this.mediaServer = mediaServers.findWhere({ domain: this.get('domain') })
        if (this.mediaServer) {
          if (this.mediaServer.get('url')) {
            return this.setAvatar()
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

      upload: function(event) {
        socket.once(this.xmppVerifyEvent, this.verifyFileUpload, this)

        var formData = new FormData()
        var file =  event.target.files[0]
        var reader = new FileReader()
        var self = this

        reader.onload = function(event) {
          var fileData = event.target.result
          formData.append('data', file)
          formData.append('content-type', file.type)
          formData.append('filename', file.name)

          var ajaxOpts = {
            url: self.getBaseUrl(),
            type: 'PUT',
            headers: {
              'Authorization':'Basic ' + self.getAuthorizationToken(),
            },
            cache: false,
            contentType: false,
            processData: false,
            success: function(data, status, jqXHR) {
              log("success", data, status, jqXHR)
              self.set('cachebust', '&'+ Date.now())
              self.trigger('change:url', self, self.get('url'))
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
