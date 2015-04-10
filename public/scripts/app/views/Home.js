define(function(require) {

    'use strict';

    var $                   = require('jquery')
      , _                   = require('underscore')
      , Base                = require('app/views/Base')
      , socket              = require('app/utils/socket')
      , ChannelListView     = require('app/views/ChannelList')
      , ActivityView        = require('app/views/Activity')
      , SettingsView        = require('app/views/Settings')
      , log                 = require('app/utils/bows.min')('Views:Home')

    return Base.extend({

        template: _.template(require('text!tpl/Home.html')),
      
        requiresLogin: true,

        title: 'Home',

        events: {
          'click .tabs-item':      'onTabClick',
          'touchstart .tab-views': 'onInputDown'
        },
      
        className: 'home screen screen--hasTabViews',
      
        initialize: function(options) {
          _.bindAll(this, 'onResize', 'onInputMove', 'onInputUp')

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
            // this.activityView,
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
          this.viewsHolder = this.$el.find('.tab-views')
          this.activeIndicator = this.$el.find('.tabs-activeIndicator')
          this.navItems = this.$el.find('.tabs-item')
          this.viewItems = this.$el.find('.tab-views-item')
          this.xMax = this.viewItems.size() - 1

          // stores the current xPos  
          this.xPos = 0

          // distance after which a touchmove is seen as a slide attempt
          this.tolerance = {
            x: 5,
            y: 10
          }

          // adapt view height when channelList got filled
          this.channelListView.on('loaded:channel', this.adaptViewsHeight, this)

          // update dimensions
          this.onResize()
          $(window).on('resize', this.onResize)

          // go to first item
          this.navigateTo(this.viewItems.first().attr('data-view'))
        },

        onDestroy: function() {
          $(window).off('resize', this.onResize)
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

        onInputDown: function(event) {
          this.startX = event.originalEvent.touches[0].pageX
          this.startY = event.originalEvent.touches[0].pageY
          $(document).on('touchmove', this.onInputMove)
          $(document).one('touchend', this.onInputUp)

          // disable transitions on the scroller so that we can move it
          this.scroller.addClass('no-transition')
          this.activeIndicator.addClass('no-transition')
        },

        onInputMove: function(event) {
          var x = this.startX - event.originalEvent.touches[0].pageX
          var y = this.startY - event.originalEvent.touches[0].pageY

          if(Math.abs(x) > this.tolerance.x && Math.abs(y) < this.tolerance.y){
            event.preventDefault()
            this.xMove = x //this.slowOnEdges(x)
            var newX = this.xPos * this.viewWidth + this.xMove
            this.moveIt(newX)
          }
        },

        slowOnEdges: function(x) {
          var position = this.xPos * this.viewWidth + x
          var min = 0
          var max = this.xMax * this.viewWidth
          if(position < min) {
            var excess = min - position;
            x *= (1 - excess / (this.viewWidth * 0.98)) * 0.98
          }
          if(position > max) {
            var excess = position - max;
            x *= (1 - excess / (this.viewWidth * 0.98)) * 0.98
          }
          return x
        },

        onInputUp: function(event) {
          $(document).off('inputmove', this.onInputMove)

          // re-enable transitions on the scroller
          this.scroller.removeClass('no-transition')
          this.activeIndicator.removeClass('no-transition')

          // did something happen that needs us to move the
          // scroller either back to its neutral position
          // or towards another slide then let's do this
          if(this.xMove){
            event.preventDefault()

            if(this.xMove >= this.viewWidth/2 && this.xPos < this.xMax) {
              this.xPos += 1
            }
            else if(this.xMove <= -this.viewWidth/2 && this.xPos > 0) {
              this.xPos -= 1
            }

            this.moveIt(this.xPos * this.viewWidth)

            this.xMove = null
          }
        },

        onTabClick: function(event) {
          this.navigateTo(event.currentTarget.getAttribute('data-target'))
        },

        navigateTo: function(viewName) {
          this.visibleTabView = this.viewItems.filter('[data-view='+ viewName +']')
          this.xPos = this.visibleTabView.index()

          // adjust height
          this.viewsHolder.css('height', this.visibleTabView.height())
          this.moveIt(this.xPos * this.viewWidth)
        },

        adaptViewsHeight: function() {
          var height = Math.max(this.visibleTabView.height(), this.contentHeight)
          this.viewsHolder.css('height', height)
        },

        moveIt: function(x) {
          var indicatorPos = x/this.viewWidth * this.tabWidth
          // limit indicator to view boundaries
          indicatorPos = Math.max(0, Math.min(this.xMax * this.tabWidth, indicatorPos))
          this.activeIndicator.css('transform', 'translateX('+ indicatorPos +'px) translateZ(0)')
          this.scroller.css('transform', 'translateX('+ (-x) +'px) translateZ(0)')
        }

    })

})
