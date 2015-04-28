define(function(require) {

    'use strict';

    var $          = require('jquery')
      , Backbone   = require('backbone')
      , _          = require('underscore')
      , socket     = require('app/utils/socket')
      , log        = require('bows.min')('Views:Topic:Report')

    return Backbone.View.extend({

      template: _.template(require('text!tpl/Topic/Report.html')),

      className: 'modal',

      events: {
        'click .js-close': 'close',
        'click .js-report-send': 'sendReport'
      },
      
      render: function() {
        _.bindAll(this, 'onKeypress')

        this.$el.html(this.template(this.model.toJSON()))
        $(document).on('keypress.modal', this.onKeypress)
        return this
      },

      onDestroy: function() {
        $(document).off('keypress.modal')
      },

      onKeypress: function(event) {
        if (event.keyCode === 13) {
          this.close(event)
        }
      },

      close: function(event) {
        event.preventDefault()
        event.stopPropagation()
        this.trigger('close')
      },

      closeView: function() {
        this.stopListening()
        this.remove()
      },

      sendReport: function(event) {
        var self = this
        var data = {
          content: this.model.get('unparsedContent'),
          author: this.model.get('authorJid'),
          postId: this.model.get('id'),
          channel: this.model.get('channelJid'),
          reason: this.$el.find('.js-report-reason').val()
        }
        log('Sending report data', data)
        socket.send(
          'message.report',
          data,
          function() {
            self.close(event)
          })    
      }

    })

})
