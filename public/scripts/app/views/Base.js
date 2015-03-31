define(function(require) {

    'use strict';
  
    var Backbone = require('backbone')

    return Backbone.View.extend({

      requiresLogin: false,
      
      title: 'Wifi Chat',
      
      initialize: function (options) {
        if (options) {
          this.router = options.router
          this.options = options
        }
      },

      render: function() {
        this.$el.html(this.template, this.model)
        return this
      },
      
      registerEvents: function() {},
      
      closeView: function() {
        Object.keys(this.subViews || {}).forEach(function(subView) {
          this.subViews[subView].closeView()
          this.subViews[subView] = null
        }, this)
        this.stopListening()
        this.remove() 
        
      },
      
      closeSubView: function(name) {
        if (!this.subViews[name]) return
        this.subViews[name].closeView()
        this.subViews[name] = null
      },
      
      showSubView: function(name, view) {
        if (!this.subViews) {
          this.subViews = {}
        }
        this.subViews[name] = view
        view.registerEvents()
        this.$el.append(view.render().$el)
      }

  })

})
