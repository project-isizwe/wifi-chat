define(function(require) {

    'use strict';

    var _         = require('underscore')
      , Base      = require('app/views/Base')
      , PostModel = require('app/models/Post')
      , socket    = require('app/utils/socket')
      , log       = require('app/utils/bows.min')('Views:Topic')

    return Base.extend({

      template: _.template(require('text!tpl/Topic/Topic.html')),

      requiresLogin: true,

      className: 'topic screen',

      initialize: function(options) {
        var self = this
        this.options = options

        var requestOptions = {
          id: options.id,
          node: '/user/'+ options.channelJid + '/posts'
        }

        socket.send('xmpp.buddycloud.retrieve', requestOptions, function(error, data) {
          log(error, data)
          if(error) {
            self.showError(error)
          } else {
            self.model = new PostModel(data)
            log(self.model)
          }
        })

        
        // this.options.model = subscriptions
        //   .findWhere({ channelJid: options.channelJid })

        // if (!this.options.model) {
        //   subscriptions.on('loaded:meta', function(model) {
        //     if (model.get('channelJid') === this.options.channelJid) {
        //       this.options.model = model
        //       this.render()
        //     }
        //   }, this)
        // }
      },
      
      beforeRender: function() {
        if (this.options.model) {
          // this.header = new HeaderView(this.options)
          // this.topicList = new TopicListView(this.options)
        }
      }, 
      
      render: function() {
        this.beforeRender()
        var data = this.model ? this.model.attributes : null
        this.$el.html(this.template(data))
        // if (this.header) {
        //   this.$el.find('header').html(this.header.render().el)
        //   this.$el.append(this.topicList.render().el)
        // }
        this.trigger('render')
        return this
      }

    })

})
