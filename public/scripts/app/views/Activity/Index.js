define(function(require) {

    'use strict';

    var _             = require('underscore')
      , Base          = require('app/views/Base')
      , PostListViw   = require('app/views/Activity/PostList')
      , log           = require('bows.min')('Views:Activity:Index')

    return Base.extend({

      template: _.template(require('text!tpl/Activity/Index.html')),

      requiresLogin: true,

      className: 'channel screen',

      initialize: function(options) {
        this.options = options
        this.router = options.router
      },
      
      beforeRender: function() {
        if (this.options.model) {
          this.header = new HeaderView(this.options)
          this.topicList = new TopicListView(this.options)
        }
      }, 
      
      render: function() {
        this.beforeRender()
        var data = this.model ? this.options.model.attributes : null
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
