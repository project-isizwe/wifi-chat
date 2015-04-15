define(function(require) {

    'use strict';

    var _                = require('underscore')
      , Base             = require('app/views/Base')
      , ActivityItemView = require('app/views/Activity/ActivityItem')
      , UserPosts        = require('app/collections/UserPosts')
      , log              = require('bows.min')('Views:Activity:Index')
    require('jquery.scrollparent')

    return Base.extend({

      template: _.template(require('text!tpl/Activity/Index.html')),

      requiresLogin: true,

      infiniteScrollTriggerPoint: 300, // in pixels from the bottom
      isInfiniteScrollLoading: false,

      untouched: true,

      title: 'My Posts',

      className: 'tab-views-item activity',

      attributes: {
        'data-view': 'activity'
      },

      initialize: function(options) {
        _.bindAll(this, 'onScroll')
        this.options = options
        this.router = options.router

        this.collection = new UserPosts()
        this.collection.on('loaded:activities', this.addActivityItems, this)
        this.collection.on('completed:activities', this.finishInfiniteScroll, this)

        this.collection.sync()

        this.options.parent.on('cache', this.unbindGlobalListeners, this)
        this.options.parent.on('retrieve', this.bindGlobalListeners, this)
        this.options.parent.on('resizeTabViews', this.onResizeTabViews, this)
        this.on('visibilitychange', this.onVisibilityChange, this)
      },

      onVisibilityChange: function(isVisible) {
        this.$el.toggleClass('is-visible', isVisible)
      },

      unbindGlobalListeners: function() {
        this.$el.scrollParent().off('scroll.activityList')
      },

      bindGlobalListeners: function() {
        this.$el.scrollParent().on('scroll.activityList', this.onScroll)
      },
      
      render: function() {
        this.$el.html(this.template())
        return this
      },

      addActivityItems: function(count) {
        // for each post, append post item
        var newItems = this.collection.models.slice(-count)
        var fragment = document.createDocumentFragment()
        var self = this

        newItems.forEach(function(newItem) {
          var item = new ActivityItemView({
            model: newItem,
            router: self.router
          })
          fragment.appendChild(item.render().el)
        }, this)
        this.$el.find('.js-infiniteLoader').before(fragment)

        this.isInfiniteScrollLoading = false

        if (this.untouched) {
          this.scrollParent = this.$el.scrollParent()
          this.bindGlobalListeners()
          this.untouched = false
        }

        if (this.collection.allItemsLoaded()) {
          this.finishInfiniteScroll()
        }
        this.renderedActivities()
      },

      finishInfiniteScroll: function() {
        log('All search results loaded, closing infinite scroll')
        this.$el.find('.js-infiniteLoader').addClass('is-hidden')
        if (!this.scrollParent) {
          return
        }
        this.scrollParent.off('scroll.activityList')
        this.renderedActivities()
        
      },

      renderedActivities: function() {
        this.scrollTopBackup = this.scrollParent.scrollTop()
        this.trigger('rendered:activities')
      },

      onResizeTabViews: function() {
        if (this.scrollTopBackup) {
          this.scrollParent.scrollTop(this.scrollTopBackup)
          this.scrollTopBackup = null
        }
      },

      onScroll: function() {
        if (this.isInfiniteScrollLoading) {
          return
        }

        var scrollHeight = (this.scrollParent.get(0) == document ? $('body') : this.scrollParent).prop('scrollHeight')
        var triggerPos = scrollHeight - this.infiniteScrollTriggerPoint
        var visibleHeight = (this.scrollParent.get(0) == document ? $(window) : this.scrollParent).outerHeight()
        var viewBottomEdge = this.scrollParent.scrollTop() + visibleHeight

        if (viewBottomEdge > triggerPos) {
          this.loadMoreItems()
        }
      },

      loadMoreItems: function() {
        this.isInfiniteScrollLoading = true
        this.collection.sync()
      },

    })

})
