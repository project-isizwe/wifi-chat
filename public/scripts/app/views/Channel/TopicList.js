define(function(require) {

    'use strict';

    var _              = require('underscore')
      , Base           = require('app/views/Base')
      , Topics         = require('app/collections/Topics')
      , TopicItemView  = require('app/views/Channel/TopicItem')
      , log            = require('bows.min')('Views:Channel:TopicList')
    require('jquery.scrollparent')

    return Base.extend({

      template: _.template(require('text!tpl/Channel/TopicList.html')),

      requiresLogin: true,

      infiniteScrollTriggerPoint: 300, // in pixels from the bottom
      isInfiniteScrollLoading: false,

      untouched: true,

      initialize: function(options) {
        _.bindAll(this, 'onScroll')

        this.options = options
        this.router = options.router
        this.collection = new Topics(null, {
          channelJid: this.options.channelJid,
          comparator: false,
        })
        this.collection.on('loaded:topics', this.addTopics, this)

        this.collection.on('error', function() {
          this.showError('Oh no! Could not load topics')
        }, this)

        if (0 !== this.collection.length) {
          return
        }
        this.collection.sync()
      },

      unbindGlobalListeners: function() {
        this.scrollParent.off('scroll.topicList')
      },

      reactivateGlobalListeners: function() {
        this.scrollParent.on('scroll.topicList', this.onScroll)
      },

      addTopics: function(length) {
        var newTopics = this.collection.models.slice(-length)
        var topics = document.createDocumentFragment()
        var self = this

        for(var i=0, l=newTopics.length; i<l; i++){
          var topic = new TopicItemView({
            model: newTopics[i],
            router: self.router
          })
          topics.appendChild(topic.render().el)
        }
        this.$el.find('.js-topicPosts').append(topics)

        this.isInfiniteScrollLoading = false

        if (this.untouched) {
          this.scrollParent = this.$el.scrollParent()
          this.scrollParent.on('scroll.topicList', this.onScroll)
          this.untouched = false
        }

        if (this.collection.allItemsLoaded()) {
          this.$el.find('.js-infiniteLoader').addClass('is-hidden')
          this.scrollParent.off('scroll.topicList')
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
          this.loadMoreTopics()
        }
      },

      loadMoreTopics: function() {
        this.isInfiniteScrollLoading = true
        this.collection.sync()
      }
    })

})
