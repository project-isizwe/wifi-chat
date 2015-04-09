define(function(require) {

    'use strict';
  
    var Backbone    = require('backbone')
      , ModalView   = require('app/views/Modal')
      , ModalModel  = require('app/models/Modal')

    return Backbone.View.extend({

      requiresLogin: false,
      
      title: 'Wifi Chat',
      
      initialize: function (options) {
        _.bindAll(this, 'render')
        
        if (options) {
          this.router = options.router
          this.options = options
          if (options.model) {
            this.model = options.model
          }
        }
        
        this.on('render', this.afterRender, this)
      },

      render: function() {
        this.beforeRender()
        var data = this.model ? this.model.attributes : null
        this.$el.html(this.template(data))
        this.trigger('render')
        return this
      },

      afterRender: function() {},
      
      beforeRender: function() {},

      onDestroy: function() {},
      
      closeView: function() {
        this.onDestroy()
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
      
      showMessage: function(message) {
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
        return modal
      },
      
      showError: function(message) {
        return this.showMessage(message)
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
