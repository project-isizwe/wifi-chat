define(function(require) {

    'use strict';

    var _                   = require('underscore')
      , Base                = require('app/views/Base')
      , ChannelModel        = require('app/models/Channel')
      , log                 = require('app/utils/bows.min')('Views:Profile')

    return Base.extend({

        template: _.template(require('text!tpl/ProfileEmpty.html')),
        profileTemplate: _.template(require('text!tpl/Profile.html')),
      
        requiresLogin: true,
      
        className: 'profile screen',

        initialize: function(options){
          _.bindAll(this, 'render')

          this.model = new ChannelModel({ node: '/user/' + options.jid + '/posts' })

          this.model.bind('loaded:meta', this.displayProfile, this)
        },

        displayProfile: function() {
          log(this.model.attributes)
          this.$el.html(this.profileTemplate(this.model.attributes))
          this.$el.find('time').timeago()
        }

    })

})
