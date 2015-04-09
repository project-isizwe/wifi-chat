define(function(require) {

    'use strict';

    var _              = require('underscore')
      , Base           = require('app/views/Base')
      , Topics         = require('app/collections/Topics')
      , TopicItemView  = require('app/views/Channel/TopicItem')
      , log            = require('app/utils/bows.min')('Views:Channel:TopicList')
    require('jquery.scrollparent')

    return Base.extend({

      template: _.template(require('text!tpl/Channel/TopicList.html')),

      requiresLogin: true,

      infiniteScrollTriggerPoint: 100, // in pixels from the bottom
      isInfiniteScrollLoading: false,

      initialize: function(options) {
        _.bindAll(this, 'onScroll')

        this.options = options
        this.router = options.router
        this.collection = new Topics(null, {
          channelJid: this.options.channelJid
        })
        this.collection.on('all', function(event) { log('TopicList', event) })
        this.collection.once('loaded:topics', this.initialRender, this)

        this.collection.on('error', function() {
          this.renderTopics()
          this.showError('Oh no! Could not load topics')
        }, this)

        if (0 !== this.collection.length) {
          return this.once('render', this.renderTopics, this)
        }
        this.collection.sync()
      },

      initialRender: function() {
        this.renderTopics()
        this.collection.on('add', this.renderTopics, this)
        this.collection.on('reset', this.renderTopics, this)
        this.collection.on('remove', this.renderTopics, this)
        this.scrollParent = this.$el.scrollParent()
        this.scrollParent.on('scroll.topicList', this.onScroll)
      },

      onDestroy: function() {
        this.scrollParent.off('scroll.topicList')
      },

      renderTopics: function() {
        var topics = document.createDocumentFragment()
        var self = this

        this.collection.forEach(function(post) {
          var topic = new TopicItemView({
            model: post,
            router: self.router
          })
          topics.appendChild(topic.render().el)
        })
        this.$el.find('.js-topicPosts').html(topics)
        this.isInfiniteScrollLoading = false
      },

      onScroll: function() {
        if(!this.isInfiniteScrollLoading) {
          var viewBottomEdge = this.scrollParent.scrollTop() + this.scrollParent.height()
          var triggerPos = this.scrollParent.prop('scrollHeight') - this.infiniteScrollTriggerPoint
          if(viewBottomEdge > triggerPos) {
            this.loadMoreTopics()
          }
        }
      },

      loadMoreTopics: function() {
        log('INFINITESCROLL: loadMoreTopics')
        this.isInfiniteScrollLoading = true
        this.collection.sync()
      }
    })

})
