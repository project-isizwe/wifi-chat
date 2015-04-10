define(function(require) {

    'use strict';

    var _              = require('underscore')
      , Avatar         = require('app/models/Avatar')
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
          this.loadAvatar()
        },

        seeAuthor: function() {
          this.options.router.showProfile(this.model.get('username'))
        },
        
        loadAvatar: function() {
          this.avatar = new Avatar({ jid: this.model.get('username') })
          this.avatar.once('loaded:avatar', this.showAvatar, this)
        },

        showAvatar: function() {
          this.$el.find('.avatar')
            .css('background-image', 'url("' + this.avatar.get('url') + '")')      
        },
      
    })

})
