define(function(require) {

    'use strict';
  
    var Backbone = require('backbone')
      , _        = require('underscore')
      , log      = require('bows.min')('Models:Channel')
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
      },
      
      defaults: {
        node: null,
        title: null,
        description: null,
        affiliation: null,
        displayName: null,
        username: null,
        creationDate: null
      },

      isMetaLoaded: false,
      
      initialize: function() {
        this.on('change:node', function() {
          this.getDetails()
        }, this)

        this.getDetails()
      },
      
      getDetails: function() {
        if (!this.get('node') || this.get('title')) return
        var options = { node: this.get('node') }
        socket.send('xmpp.buddycloud.config.get', options, _.bind(this.populateDetails, this))
      },
      
      populateDetails: function(error, data) {
        if (error) {
          log('Error retrieving details for node: ' + this.get('node'))
          return
        }
        var config = {}
        data.forEach(function(d) {
          if (this.configurationMap[d.var]) {
            config[this.configurationMap[d.var]] = d.value
          }
        }, this)
        config['channelJid'] = /[^\/]*.@.[^\/]*/.exec(this.get('node'))[0]

        if (config['title'] === config['channelJid']) {
          config['title'] = null
        } else {
          config['displayName'] = config['title']
        }
        if (config['description'] === config['channelJid']) {
          config['description'] = null
        }
        this.isMetaLoaded = true
        config.username = config.channelJid
        
        if (config.channelJid.split('@')[1] === localStorage.getItem('jid').split('@')[1]) {
          config.username = config.channelJid.split('@')[0]
        }
        this.set(config)
        this.trigger('loaded:meta', this)
      },

      isLoaded: function() {
        return this.isMetaLoaded
      }
      
    })

})