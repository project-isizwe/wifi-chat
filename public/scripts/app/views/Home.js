define(function(require) {

    'use strict';

    var $               = require('jquery')
      , _               = require('underscore')
      , Hammer          = require('hammer.min')
      , Base            = require('app/views/Base')
      , socket          = require('app/utils/socket')
      , ChannelListView = require('app/views/ChannelList')
      , ActivityView    = require('app/views/Activity/Index')
      , SettingsView    = require('app/views/Settings')
      , log             = require('bows.min')('Views:Home')

    return Base.extend({

        template: _.template(require('text!tpl/Home.html')),
      
        requiresLogin: true,

        title: 'Home',

        events: {
          'click .tabs-item': 'onTabClick',
        },
      
        className: 'home screen screen--hasTabViews',
      
        initialize: function(options) {
          _.bindAll(this, 'onResize', 'onPanStart', 'onPanMove', 'onPanEnd', 'onTransitionEnd')

          this.options = options
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
          this.scroller = this.$el.find('.tab-scroller')
          this.scroller.append(tabViews)
          this.trigger('render')
          this.initializeTabViews()

          return this
        },

        initializeTabViews: function() {
          var self = this
          this.viewsHolder = this.$el.find('.tab-views')
          this.activeIndicator = this.$el.find('.tabs-activeIndicator')
          this.navItems = this.$el.find('.tabs-item')
          this.viewItems = this.$el.find('.tab-views-item')
          this.xMax = this.viewItems.size() - 1

          this.scroller.on('transitionend', this.onTransitionEnd)

          this.hammertime = new Hammer(this.scroller.get(0))

          this.hammertime.on('panstart', this.onPanStart)
          this.hammertime.on('panmove', this.onPanMove)
          this.hammertime.on('panend', this.onPanEnd)

          // stores the current xPos  
          this.xPos = 0

          // adapt view height when channelList got filled
          this.channelListView.on('loaded:channel', this.adaptViewsHeight, this)

          // broadcast settings error (avatar upload)
          this.settingsView.on('error', this.showError, this)

          // adapt view height when activities got rendered
          this.activityView.on('rendered:activities', this.adaptViewsHeight, this)
          this.on('resizeTabViews', function(){ self.activityView.trigger('resizeTabViews') })

          // update dimensions
          this.onResize()
          $(window).on('resize.home', this.onResize)

          // go to first item
          this.navigateTo(this.viewItems.first().attr('data-view'))
        },

        onDestroy: function() {
          this.scroller.off('transitionend', this.onTransitionEnd)
          $(window).off('resize.home', this.onResize)
          this.hammertime.destroy()
        },

        onResize: function() {
          var self = this
          this.viewWidth = this.$el.width()
          this.tabWidth = this.navItems.first().outerWidth()
          this.activeIndicator.width(this.tabWidth)

          // cache visible view area height
          this.contentHeight = this.$el.outerHeight() - this.$el.find('.screen-header').height()

          this.scroller.width(this.viewItems.size() * this.viewWidth)

          this.viewItems.css({
            width: this.viewWidth,
            left: function(i) { return i * self.viewWidth }
          })

          if(this.visibleTabView)
            this.navigateTo(this.visibleTabView.attr('data-view'))
        },

        onPanStart: function() {
          // disable transitions on the scroller so that we can move it
          this.scroller.addClass('no-transition')
          this.activeIndicator.addClass('no-transition')
        },

        onPanMove: function(event) {
          var newX = this.xPos * this.viewWidth - event.deltaX
          this.moveIt(newX)
        },

        onPanEnd: function(event) {

          // re-enable transitions on the scroller
          this.scroller.removeClass('no-transition')
          this.activeIndicator.removeClass('no-transition')

          if(event.deltaX < -this.viewWidth/2 && this.xPos < this.xMax) {
            this.xPos += 1
          }
          else if(event.deltaX > this.viewWidth/2 && this.xPos > 0) {
            this.xPos -= 1
          }

          this.navigateTo(this.viewItems.eq(this.xPos).attr('data-view'))
        },

        onTabClick: function(event) {
          this.navigateTo(event.currentTarget.getAttribute('data-target'))
        },

        navigateTo: function(viewName) {
          this.visibleTabView = this.viewItems.filter('[data-view='+ viewName +']')
          this.xPos = this.visibleTabView.index()

          this.visibleTabView.addClass('is-visible')

          // adjust height
          this.adaptViewsHeight()

          this.moveIt(this.xPos * this.viewWidth)
        },

        onTransitionEnd: function() {
          this.viewItems.filter('.is-visible').not(this.visibleTabView).removeClass('is-visible')
        },

        adaptViewsHeight: function() {
          // reset height
          this.viewsHolder.css('height', '')
          var height = Math.max(this.visibleTabView.height(), this.contentHeight)
          this.viewsHolder.css('height', height)
          this.trigger('resizeTabViews')
        },

        moveIt: function(x) {
          var indicatorPos = x/this.viewWidth * this.tabWidth
          // limit indicator to view boundaries
          indicatorPos = Math.max(0, Math.min(this.xMax * this.tabWidth, indicatorPos))
          this.activeIndicator.css('transform', 'translateX('+ indicatorPos +'px)')
          this.scroller.css('transform', 'translateX('+ (-x) +'px)')
        }

    })

})
