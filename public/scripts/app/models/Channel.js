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
      
      initialize: function() {
        this.on('change:node', function() {
          this.getDetails()
        }, this)

        this.getDetails()
      },
      
      getDetails: function() {
        if (!this.get('node') || this.get('title')) return
        log('Retrieving channel details for ' + this.get('node'))
        var options = { node: this.get('node') }
        socket.send('xmpp.buddycloud.config.get', options, _.bind(this.populateDetails, this))

        // get mediaServer endpoint from cache
        
        var domain = /@(.*)\//.exec(this.get('node'))[1]
        // this.cache.getMediaServer(domain)).then(this.renderAvatar)
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

        if(config['title'] == config['channelJid'])
          config['title'] = ''

        this.set(config)
        this.trigger('loaded:meta', this)
      }
      
    })

})
