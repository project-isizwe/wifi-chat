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
      emptyTemplate: _.template(require('text!tpl/Activity/Empty.html')),

      requiresLogin: true,

      infiniteScrollTriggerPoint: 300, // in pixels from the bottom
      isInfiniteScrollLoading: false,

      untouched: true,

      title: 'My Posts',

      hasRendered: false,

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
        this.collection.on('completed:activities', this.allActivitiesLoaded, this)
        this.collection.on('pushed:activities', this.addActivityItems, this)
        this.on('resizeTabViews', this.onResizeTabViews, this)

        this.collection.sync()

        this.options.parent.on('cache', this.unbindGlobalListeners, this)
        this.options.parent.on('retrieve', this.bindGlobalListeners, this)
      },

      unbindGlobalListeners: function() {
        this.$el.scrollParent().off('scroll.activityList')
      },

      bindGlobalListeners: function() {
        this.$el.scrollParent().on('scroll.activityList', this.onScroll)
      },
      
      render: function() {
        if (0 === this.collection.length) {
          log('Using empty activities template')
          this.$el.html(this.emptyTemplate())
        } else {
          log('Using populated activities template')
          this.$el.html(this.template())
        }
        return this
      },

      allActivitiesLoaded: function() {
        if (0 === this.collection.length) {
          this.template = this.emptyTemplate
        }
        this.finishInfiniteScroll()
      },

      addActivityItems: function(count) {
        log('Adding activities')
        // for each post, append post item
        var newItems =  null
        if (count instanceof Backbone.Model) {
          newItems = [ count ]
          if (1 === this.collection.length) {
            this.render()
          }
        } else {
          newItems = this.collection.models.slice(-count)
          log(length + ' new comments')
        }
        var fragment = document.createDocumentFragment()
        var self = this

        if (!this.hasRendered) {
          this.hasRendered = true
          this.render()
        }
        newItems.forEach(function(newItem) {
          var item = new ActivityItemView({
            model: newItem,
            router: self.router
          })
          fragment.appendChild(item.render().el)
        }, this)

        if (count instanceof Backbone.Model) {
          this.$el.prepend(fragment)
          this.$el.find('.js-no-activities').remove()
        } else {
          this.$el.find('.js-infiniteLoader').before(fragment)
        }

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
