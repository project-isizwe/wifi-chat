define(function(require) {

    'use strict';
  
    var Backbone    = require('backbone')
      , ModalView   = require('app/views/Modal')
      , ModalModel  = require('app/models/Modal')

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
          delete this.subViews[subView]
        }, this)
        this.stopListening()
        this.remove()
      },
      
      closeSubView: function(name) {
        if (!this.subViews || !this.subViews[name]) return
        this.subViews[name].closeView()
        delete this.subViews[name]
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
      
      showError: function(message) {
        this.closeSubView('modal')
        var modal = new ModalView()
        modal.model = new ModalModel({
          message: message,
          showClose: true
        })
        this.showSubView('modal', modal)
        modal.once('close', function() {
          this.closeSubView('modal')
        }, this)
      },

      showSpinner: function(message) {
        this.closeSubView('modal')
        var modal = new ModalView()
        modal.model = new ModalModel({
          type: 'spinner',
          message: message,
          showClose: false
        })
        this.showSubView('modal', modal)
        modal.once('close', function() {
          this.closeSubView('modal')
        }, this)
      },

      closeSpinner: function() {
        this.closeSubView('modal')
      }

  })

})
