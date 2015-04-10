define(function(require) {

    'use strict';

    var _    = require('underscore')
      , Base = require('app/views/Base')
      , Post = require('app/models/Post')
      , log  = require('app/utils/bows.min')('Views:Channel:Header')

    return Base.extend({

        template: _.template(require('text!tpl/Empty.html')),
        postTemplate: _.template(require('text!tpl/Topic/Header.html')),

        requiresLogin: true,

        canRender: false,

        events: {
          'click .js-seeAuthor': 'seeAuthor',
        },

        initialize: function(options) {
        	this.options = options
        	this.router = options.router
        	this.model = new Post({
        		node: this.options.node,
        		id: this.options.id
        	})
        	this.model.once('loaded:post', this.renderPost, this)
        	this.model.sync()
        },

        renderPost: function() {
          this.template = this.postTemplate
        	this.render()
        },

        render: function() {
        	this.beforeRender()
	        var data = this.model ? this.model.attributes : null
	        this.$el.html(this.template(data))
          this.$el.find('time').timeago()
	        this.trigger('render')
	        return this
        },

        seeAuthor: function() {
          this.options.router.showProfile(this.model.get('username'))
        },

    })

})
