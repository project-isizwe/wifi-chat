define(function(require) {

    'use strict';

    var _             = require('underscore')
      , Base          = require('app/views/Base')
      , HeaderView    = require('app/views/Channel/Header')
      , subscriptions = require('app/store/Subscriptions')
      , log           = require('app/utils/bows.min')('Views:Channel')

    return Base.extend({

      template: _.template(require('text!tpl/Channel.html')),

      requiresLogin: true,

      className: 'channel screen',

      initialize: function(options) {

        options.model = subscriptions
          .findWhere({ channelJid: options.channelJid })

        this.header = new HeaderView(options)
      //  this.threads = new ThreadView(options)

        this.options = options
        this.router = options.router
      },
      
      render: function() {
        this.beforeRender()
        var data = this.model ? this.model.attributes : null
        this.$el.html(this.template(data))
        this.$el.find('header').html(this.header.render().el)
        this.trigger('render')
        return this
      },
    })

})
