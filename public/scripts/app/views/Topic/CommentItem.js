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
        },

        render: function(){
          this.$el.html(this.template(_.extend(this.model.attributes, {
            avatarUrl: this.avatar && this.avatar.get('url')
          })))
          this.$el.find('time').timeago()

          if(!this.avatar)
            this.loadAvatar()

          return this
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
