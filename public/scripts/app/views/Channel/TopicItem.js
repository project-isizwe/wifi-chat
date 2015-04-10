define(function(require) {

    'use strict';

    var _              = require('underscore')
      , Base           = require('app/views/Base')
      , log            = require('app/utils/bows.min')('Views:TopicItem')
    require('jquery.timeago')

    return Base.extend({

        template: _.template(require('text!tpl/Channel/TopicItem.html')),
      
        requiresLogin: true,

        tagName: 'section',

        className: 'post post--topic',

        events: {
          'click .js-comment': 'addComment'
        },
      
        afterRender: function() {
          this.$el.find('time').timeago()
        }
      
    })

})
