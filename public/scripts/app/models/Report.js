define(function(require) {

    'use strict';
  
    var Backbone = require('backbone')
      , socket   = require('app/utils/socket')

    return Backbone.Model.extend({

      defaults: {
        subCategory: ''
      },

      socketEvents: {
        post: 'ticket.create'
      },

      sync: function(method, collection, options) {
        if (!method) {
          method = 'get'
        }
        
        switch (method) {
          case 'post':
          case 'create':
            return this.createTicket()
          default:
            throw new Error('Unhandled method: ' + method)
        }
            
      },

      createTicket: function() {
        var payload = {
          description: this.get('description'),
          category: this.get('category'),
          subCategory: this.get('subCategory'),
          idNumber: this.get('idNumber')
        }

        if (this.has('location')) {
        	payload.location = this.get('location')
        }

        var self = this
        var event = this.socketEvents['post']
        socket.send(event, payload, function(error, success) {
          if (error) {
            return self.trigger('ticket:error', error)
          }
          self.trigger('ticket:success')
        })
      }

    })

})
