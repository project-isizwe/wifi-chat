define(function(require) {

    'use strict';
  
    var Backbone = require('backbone')
      , Spinner  = require('app/models/modal/Spinner')

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
        if (!this.subViews || !this.subViews[name]) return
        this.subViews[name].closeView()
        this.subViews[name] = null
      },
      
      showSubView: function(name, view, element) {
        if (!this.subViews) {
          this.subViews = {}
        }
        this.subViews[name] = view
        view.delegateEvents()
        if (element) {
          this.$el.find(element).html(view.render().$el)
        } else {
          this.$el.append(view.render().$el)
        }
      },
      
      showError: function(model) {
        this.closeSubView('modal')
        this.modal.model = model
        this.showSubView('modal', this.modal)
        this.modal.on('close', function() {
          this.closeSubView('modal')
        }, this)
      },

      showSpinner: function() {
        this.modal.model = new Spinner({
          type: 'spinner',
          message: '',
          showClose: false
        })
        this.showSubView('modal', this.modal)
      },

      closeSpinner: function() {
        this.closeSubView('modal')
      }

  })

})
