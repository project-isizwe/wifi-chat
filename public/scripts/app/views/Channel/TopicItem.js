define(function(require) {

    'use strict';

    var _              = require('underscore')
      , Base           = require('app/views/Base')
      , log            = require('app/utils/bows.min')('Views:Topic')
    require('jquery.timeago')

    return Base.extend({

        template: _.template(require('text!tpl/Channel/TopicItem.html')),
      
        requiresLogin: true,

        initialize: function(options){
          _.bindAll(this, 'render')

          this.model.bind('change', this.render)
          this.on('render', this.afterRender, this)
        },
      
        afterRender: function() {
          this.$el.find('time').timeago()
        }
      
    })

})
