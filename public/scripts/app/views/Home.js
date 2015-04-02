define(function(require) {

    'use strict';

    var _                   = require('underscore')
      , Base                = require('app/views/Base')
      , socket              = require('app/utils/socket')
      , ChannelListView     = require('app/views/ChannelList')
      , ActivityView        = require('app/views/Activity')
      , SettingsView        = require('app/views/Settings')
      , log                 = require('app/utils/bows.min')('Views:Home')

    return Base.extend({

        template: _.template(require('text!tpl/Home.html')),
      
        requiresLogin: true,

        events: {
          'click .tabs-item': 'onTabClick'
        },
      
        className: 'home screen screen--hasTabViews',
      
        initialize: function(options) {
          _.bindAll('onTabClick')

          this.options = options
          this.router = options.router

          this.tabViews = []
          this.tabViews.push(new ChannelListView(options))
          this.tabViews.push(new ActivityView(options))
          this.tabViews.push(new SettingsView(options))
        },

        render: function() {
          var tabViews = document.createDocumentFragment()

          this.tabViews.forEach(function(view){
            tabViews.appendChild(view.render().el)
          })

          this.$el.html(this.template())
          this.$el.find('.tab-views').append(tabViews)
          this.trigger('render')

          this.navigateTo(this.$el.find('.tab-views-item').first().attr('data-view'))

          return this
        },

        onTabClick: function(event) {
          this.navigateTo(event.currentTarget.getAttribute('data-target'))
        },

        navigateTo: function(viewName) {
          this.$el.find('.tabs-item.is-active').removeClass('is-active')
          this.$el.find('.tabs-item[data-target='+ viewName +']').addClass('is-active')
          var targetView = this.$el.find('.tab-views-item[data-view='+ viewName +']')
          var tabViewsOffset = - targetView.index() * targetView.width()
          this.$el.find('.tab-views').css({
            transform: 'translateX('+ tabViewsOffset +'px)',
            height: targetView.height()
          })
        }

    })

})
