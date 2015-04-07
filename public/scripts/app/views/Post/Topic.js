define(function(require) {

    'use strict';

    var _              = require('underscore')
      , Base           = require('app/views/Base')
      , socket         = require('app/utils/socket')
      , log            = require('app/utils/bows.min')('Views:Post:ThreadStart')
    require('jquery.timeago')

    return Base.extend({

        template: _.template(require('text!tpl/Post/Topic.html')),
      
        requiresLogin: true,

        initialize: function(options){
            _.bindAll(this, 'render')

            this.router = options.router
            this.model.bind('change', this.render)
            this.on('render', this.afterRender, this)
          },
        
          afterRender: function() {
            this.$el.find('time').timeago()
          }
      
    })

})
