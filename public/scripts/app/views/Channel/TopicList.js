define(function(require) {

    'use strict';

    var _              = require('underscore')
      , Base           = require('app/views/Base')
      , Topics         = require('app/collections/Topics')
      , TopicItemView  = require('app/views/Channel/TopicItem')
      , log            = require('app/utils/bows.min')('Views:Channel:TopicList')

    return Base.extend({

      template: _.template(require('text!tpl/Channel/TopicList.html')),

      requiresLogin: true,

      initialize: function(options) {

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
        this.$el.html(topics)
      }
    })

})
