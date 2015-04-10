define(function(require) {

    'use strict';
  
    var Channel  = require('app/models/Channel')
      , log      = require('app/utils/bows.min')('Models:User')
      , socket   = require('app/utils/socket')

    return Channel.extend({

      xmppEvent: 'xmpp.buddycloud.config.set',

      initialize: function() {
        this.on('change:node', this.getDetails, this)
      },

      sync: function(method, model, options) {
        switch (method) {
          case 'post':
          case 'create':
            this.updateChannelConfiguration()
            break
          default:
            throw new Error('Unhandled method: ' + method)
        }
            
      },

      updateChannelConfiguration: function() {
        var data = { node: this.get('node'), form: [] }
        Object.keys(this.configurationMap).forEach(function(xmppKey) {
          var modelKey = this.configurationMap[xmppKey]
          var value = null
          switch (modelKey) {
            case 'title':
            case 'description':
            case 'accessModel':
            case 'channelType':
            case 'defaultAffiliation':
            case 'contentType':
              value = this.get(modelKey)
              if (!value) {
                return
              }
              break
            case 'creator':
              value = this.get('jid')
            default:
              return
          }
          data.form.push({
            var: xmppKey, 
            value: value
          })
        }, this)
        socket.send(this.xmppEvent, data, function(error, success) {
          if (error) {
            return log('Error saving channel configuration', error)
          }
          log('Saved channel configuration')
        })
      }

    })

})
