define(function(require) {

    'use strict';
  
    var Backbone = require('backbone')
      , _        = require('underscore')
      , log      = require('app/utils/bows.min')('Models:Channel')
      , socket   = require('app/utils/socket')

    return Backbone.Model.extend({
      
      configurationMap: {
        'pubsub#title': 'title',
        'pubsub#description': 'description',
        'pubsub#access_model': 'accessModel',
        'buddycloud#channel_type': 'channelType',
        'pubsub#creator': 'creator',
        'buddycloud#default_affiliation': 'defaultAffiliation',
        'pubsub#creation_date': 'creationDate',
        'buddycloud#updated_date': 'updatedDate',
        'pubsub#type': 'contentType'
      }
      
      defaults: {
        node: null,
        title: null,
        decription: null
      },
      
      initialize: function() {
        this.on('change:node', function() {
          this.getDetails()
        }, this)
      },
      
      getDetails: function() {
        if (!this.get('node') || this.get('title')) return
        log('Retrieving channel details for ' + this.get('node'))
        var options = { node: this.get('node') }
        socket.send('xmpp.buddycloud.config.get', options, _.bind(populateDetails, this))
      },
      
      populateDetails: function(error, data) {
        if (error) {
          log('Error retrieving details for node: ' + this.get('node'))
          return
        }
        log('Have configuration data', data)
        data.forEach(function(d) {
          if (this.configurationMap[d]) {
            this.set(this.configurationMap[d], d.value)
          }
        }, this)
      }
      
    })

})
