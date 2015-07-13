define(function(require) {

    'use strict';

    var $               = require('jquery')
      , _               = require('underscore')
      , Hammer          = require('hammer.min')
      , Base            = require('app/views/Base')
      , socket          = require('app/utils/socket')
      , ChannelListView = require('app/views/ChannelList')
      , ReportView      = require('app/views/Report/Index')
      , ActivityView    = require('app/views/Activity/Index')
      , SettingsView    = require('app/views/Settings')
      , log             = require('bows.min')('Views:Home')
    require('modernizr')

    return Base.extend({

        template: _.template(require('text!tpl/Home.html')),
      
        requiresLogin: true,

        cacheable: true,

        type: 'homescreen',

        title: 'Home',

        homepage: 'chats',

        events: {
          'click .tabs-item': 'onTabClick',
        },
      
        className: 'home screen screen--hasTabViews',
      
        initialize: function(options) {
          _.bindAll(this, 'onResize', 'onPanStart', 'onPanMove', 'onPanEnd', 'onTransitionEnd')

          this.options = options
          this.router = options.router

          var transEndEventNames = {
            'WebkitTransition' : 'webkitTransitionEnd',// Saf 6, Android Browser
            'MozTransition'    : 'transitionend',      // only for FF < 15
            'transition'       : 'transitionend'       // IE10, Opera, Chrome, FF 15+, Saf 7+
          }
          this.transEndEventName = transEndEventNames[ Modernizr.prefixed('transition') ]
        },
      
        beforeRender: function() {
          if (this.channelListView) {
            return
          }
          this.channelListView = new ChannelListView(this.options)
          this.reportView = new ReportView(this.options)
          this.activityView = new ActivityView(_.extend(this.options, { parent: this }))
          this.settingsView = new SettingsView(this.options)

          this.tabViews = [
            this.channelListView,
            this.reportView,
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

          this.scroller.on(this.transEndEventName, this.onTransitionEnd)

          if (Modernizr.touch) {
            this.bindTouchControls()
          }

          // stores the current xPos  
          this.xPos = null

          // adapt view height when channelList got filled
          this.channelListView.on('loaded:channel', this.adaptViewsHeight, this)

          // broadcast settings error (avatar upload)
          this.settingsView.on('error', this.showError, this)

          // adapt view height when activities got rendered
          this.activityView.on('rendered:activities', this.adaptViewsHeight, this)

          // update dimensions
          this.onResize()
          $(window).on('resize.home', this.onResize)

          // go to item we get from route
          this.navigateTo(this.options.route || this.homepage)
        },

        bindTouchControls: function() {
          this.hammertime = new Hammer(this.scroller.get(0))

          this.hammertime.on('panstart', this.onPanStart)
          this.hammertime.on('panmove', this.onPanMove)
          this.hammertime.on('panend', this.onPanEnd)
        },

        onDestroy: function() {
          this.scroller.off('transitionend', this.onTransitionEnd)
          $(window).off('resize.home', this.onResize)

          if (this.hammertime) {
            this.hammertime.destroy()
          }
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

          if (this.visibleTabView) {
            var resizeScrollTopBackup = this.$el.scrollParent().scrollTop()
            this.navigateTo(this.visibleTabView.attr('data-view'))
            this.$el.scrollParent().scrollTop(resizeScrollTopBackup)
          }
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
          var viewChange = false

          // re-enable transitions on the scroller
          this.scroller.removeClass('no-transition')
          this.activeIndicator.removeClass('no-transition')

          if(event.deltaX < -this.viewWidth/2 && this.xPos < this.xMax) {
            this.xPos += 1
            viewChange = true
          }
          else if(event.deltaX > this.viewWidth/2 && this.xPos > 0) {
            this.xPos -= 1
            viewChange = true

          }

          if (viewChange) {
            this.navigateTo(this.viewItems.eq(this.xPos).attr('data-view'))
          } else {
            this.moveIt(this.xPos * this.viewWidth)
          }
        },

        onTabClick: function(event) {
          this.navigateTo(event.currentTarget.getAttribute('data-target'))
        },

        navigateTo: function(viewName) {
          this.visibleTabView = this.viewItems.filter('[data-view='+ viewName +']')
          this.lastxPos = this.xPos
          this.xPos = this.visibleTabView.index()


          // trigger visibilitychange on view
          this.tabViews[this.xPos].trigger('visibilitychange', true)

          // adjust height
          this.adaptViewsHeight()

          this.moveIt(this.xPos * this.viewWidth)

          if (viewName == this.homepage) {
            viewName = ''
          }
          this.router.navigate('/'+ viewName, { trigger: false })
        },

        onTransitionEnd: function() {
          if (this.lastxPos != null) {
            this.tabViews[this.lastxPos].trigger('visibilitychange', false)
          }
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
