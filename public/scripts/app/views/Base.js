define(function(require) {

    'use strict';
  
    var Backbone = require('backbone')

    return Backbone.View.extend({
      
      events: {},
      
      requiresLogin: false,
      
      title: 'Wifi Chat',
      
      initialize: function (options) {
        this.router = options.router
        this.options = options
      },

      render: function() {
        this.$el.html(this.template)
        return this
      },
      
      registerEvents: function() {}

  })

})
