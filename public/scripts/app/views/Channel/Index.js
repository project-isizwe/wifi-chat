define(function(require) {

    'use strict';

    var _             = require('underscore')
      , Base          = require('app/views/Base')
      , HeaderView    = require('app/views/Channel/Header')
      , TopicListView = require('app/views/Channel/TopicList')
      , subscriptions = require('app/store/Subscriptions')
      , log           = require('bows.min')('Views:Channel:Index')

    return Base.extend({

      template: _.template(require('text!tpl/Empty.html')),

      requiresLogin: true,

      cacheable: true,

      type: 'channel',

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
              this.renderFilled()
            }
          }, this)
        } else {
          this.once('render', this.renderFilled, this)
        }
      },
      
      renderFilled: function() {
        this.header = new HeaderView(this.options)
        this.topicList = new TopicListView(_.extend(this.options, { parent: this }))

        // add list to header before adding it to the view
        // to save one dom access
        this.$el.html(this.header.render().$el.add(this.topicList.render().el))

        return this
      }

    })

})
