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

        },
      
        beforeRender: function() {
          if (this.channelListView) {
            return
          }
          this.channelListView = new ChannelListView(this.options)
          this.activityView = new ActivityView(this.options)
          this.settingsView = new SettingsView(this.options)

          this.tabViews = [
            this.channelListView,
            this.activityView,
            this.settingsView
          ]
        },

        render: function() {
          this.beforeRender()
          var tabViews = document.createDocumentFragment()

          this.tabViews.forEach(function(view){
            tabViews.appendChild(view.render().el)
          })

          this.$el.html(this.template())
          this.$el.find('.tab-views').append(tabViews)
          this.trigger('render')

          this.navigateTo(this.$el.find('.tab-views-item').first().attr('data-view'))

          this.channelListView.on('channel:loaded', this.adaptViewsHeight, this)

          this.contentHeight = this.$el.outerHeight() - this.$el.find('.screen-header').height()

          return this
        },

        onTabClick: function(event) {
          this.navigateTo(event.currentTarget.getAttribute('data-target'))
        },

        navigateTo: function(viewName) {
          // deactivate old tab
          this.$el.find('.tabs-item.is-active').removeClass('is-active')
          // active active tab
          this.$el.find('.tabs-item[data-target='+ viewName +']').addClass('is-active')

          this.visibleTabView = this.$el.find('.tab-views-item[data-view='+ viewName +']')
          var tabViewsOffset = - this.visibleTabView.index() * this.visibleTabView.width()

          // scroll to tab view
          this.$el.find('.tab-views').css({
            transform: 'translateX('+ tabViewsOffset +'px)',
            height: this.visibleTabView.height()
          })
        },

        adaptViewsHeight: function() {
          var height = Math.max(this.visibleTabView.height(), this.contentHeight)
          this.$el.find('.tab-views').css('height', height)
        }

    })

})
