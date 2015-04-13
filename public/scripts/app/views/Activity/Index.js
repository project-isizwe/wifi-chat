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
        this.options = options
        this.router = options.router

        this.collection = new UserPosts()
        this.collection.on('loaded:activities', this.addActivityItems, this)


        // if (0 !== this.collection.length) {
        //   return this.addActivityItems(0)
        // }

        this.collection.sync()
      },

      unbindGlobalListeners: function() {
        this.scrollParent.off('scroll.activityList')
      },

      reactivateGlobalListeners: function() {
        this.scrollParent.on('scroll.activityList', this.onScroll)
      },
      
      render: function() {
        this.$el.html(this.template())
        return this
      },

      addActivityItems: function(count) {
        // for each post, append post item
        var newItems = this.collection.models.slice(-length)
        var fragment = document.createDocumentFragment()
        var self = this

        for(var i=0, l=newItems.length; i<l; i++){
          var item = new ActivityItemView({
            model: newItems[i],
            router: self.router
          })
          fragment.appendChild(item.render().el)
        }
        this.$el.append(fragment)

        this.isInfiniteScrollLoading = false

        if (this.untouched) {
          this.scrollParent = this.$el.scrollParent()
          this.scrollParent.on('scroll.activityList', this.onScroll)
          this.untouched = false
        }

        if (this.collection.allItemsLoaded()) {
          this.$el.find('.js-infiniteLoader').addClass('is-hidden')
          this.scrollParent.off('scroll.activityList')
        }

        var scrollHeight = (this.scrollParent.get(0) == document ? $('body') : this.scrollParent).prop('scrollHeight')
        this.triggerPos = scrollHeight - this.infiniteScrollTriggerPoint
        this.height = (this.scrollParent.get(0) == document ? $(window) : this.scrollParent).height()
      },

      onScroll: function() {
        if(this.isInfiniteScrollLoading) {
          return
        }

        var viewBottomEdge = this.scrollParent.scrollTop() + this.height

        if(viewBottomEdge > this.triggerPos) {
          this.loadMoreItems()
        }
      },

      loadMoreItems: function() {
        this.isInfiniteScrollLoading = true
        this.collection.sync()
      }

    })

})
