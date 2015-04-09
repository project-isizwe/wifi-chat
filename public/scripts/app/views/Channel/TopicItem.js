define(function(require) {

    'use strict';

    var _              = require('underscore')
      , Base           = require('app/views/Base')
      , log            = require('app/utils/bows.min')('Views:TopicItem')
    require('jquery.timeago')

    return Base.extend({

        template: _.template(require('text!tpl/Channel/TopicItem.html')),
      
        requiresLogin: true,

        initialize: function(options){
          _.bindAll(this, 'render')
var self = this
          this.model.bind('change', this.render)
          this.on('render', this.afterRender, this)

          this.model.bind('change:commentCount', function() {
            log('updated comment')
            self.render()
          }, this)
        },
      
        afterRender: function() {
          this.$el.find('time').timeago()
        }
      
    })

})
