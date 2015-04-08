define(function(require) {

    'use strict';

    var _             = require('underscore')
      , Base          = require('app/views/Base')
      , HeaderView    = require('app/views/Channel/Header')
      , TopicListView = require('app/views/Channel/TopicList')
      , subscriptions = require('app/store/Subscriptions')
      , log           = require('app/utils/bows.min')('Views:Channel')

    return Base.extend({

      template: _.template(require('text!tpl/Channel/Channel.html')),

      requiresLogin: true,

      className: 'channel screen',

      initialize: function(options) {
        this.options = options
        this.router = options.router
        
        this.options.model = subscriptions
          .findWhere({ channelJid: options.channelJid })

        if (!this.options.model) {
          subscriptions.on('loaded:meta', function(model) {
            if (model.get('channelJid') === this.options.channelJid) {
              this.options.model = model
              this.render()
            }
          }, this)
        }
      },
      
      beforeRender: function() {
        if (this.options.model) {
          this.header = new HeaderView(this.options)
          this.topicList = new TopicListView(this.options)
        }
      }, 
      
      render: function() {
        this.beforeRender()
        var data = this.model ? this.model.attributes : null
        this.$el.html(this.template(data))
        if (this.header) {
          this.$el.find('header').html(this.header.render().el)
          this.$el.append(this.topicList.render().el)
        }
        this.trigger('render')
        return this
      }

    })

})
