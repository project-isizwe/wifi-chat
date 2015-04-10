define(function(require) {

    'use strict';

    var _              = require('underscore')
      , Base           = require('app/views/Base')
      , log            = require('app/utils/bows.min')('Views:Topic/CommentList')
    require('jquery.timeago')

    return Base.extend({

        template: _.template(require('text!tpl/Topic/CommentItem.html')),
      
        requiresLogin: true,

        tagName: 'article',

        className: 'post post--comment',

        events: {
          'click .js-seeAuthor': 'seeAuthor',
        },

        initialize: function(options){
          _.bindAll(this, 'render')

          this.model.bind('change', this.render)
          this.on('render', this.afterRender, this)
        },
      
        afterRender: function() {
          this.$el.find('time').timeago()
        },

        seeAuthor: function() {
          this.options.router.showProfile(this.model.get('username'))
        },
      
    })

})
