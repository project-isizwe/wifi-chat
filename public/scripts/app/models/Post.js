define(function(require) {

    'use strict';
  
    var Backbone = require('backbone')
      , _        = require('underscore')
      , log      = require('bows.min')('Models:Post')
      , socket   = require('app/utils/socket')
      , channels = require('app/store/Channels')
      , config   = require('app/utils/config')

    return Backbone.Model.extend({
      
      xmppEvents: {
        'get': 'xmpp.buddycloud.retrieve',
        'post': 'xmpp.buddycloud.publish'
      },

      defaults: {
        content: null,
        author: {},
        published: null,
        commentCount: '∞'
      },

      embedReceipts: [
        {
          name: 'WiFi TV',
          regex: /https:\/\/www.connectuptv.pockittv.mobi\/v\/(\d*)/g,
          substitution: '<div class="post-media post-media--video post-media--wifitv"><video width="320" height="240" poster="https://www.connectuptv.pockittv.mobi/video/image/$1" controls preload="none"><source src="$&" /></video></div>'
        },
        {
          name: 'Images',
          regex: /(https?):\/\/[^\s\/$.?#].+(jpg|jpeg|png|gif|svg)/g,
          substitution: '<div class="post-media post-media--image"><img src="$&" /></div>'
        },
        {
          name: 'Link',
          // regex for http and https links with a negative lookahead
          // that ignores links inside html tags (e.g. previously parsed links)
          regex: /(https?):\/\/[^\s\/$.?#].[^\s]*(?![^<>]*>)/g,
          substitution: '<a rel="nofollow" target="_blank" href="$&">$&</a>'
        }
        // {
        //   name: 'Youtube',
        //   regex: /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/g,
        //   substitution: '<div class="post-media post-media--video  post-media--youtube"><div class="iframe-wrapper"><iframe id="ytplayer" type="text/html" width="320" height="240" src="http://www.youtube.com/embed/$1" frameborder="0"/></div></div>'
        // }
      ],
      
      initialize: function(post) {
        if (!post.entry) {
          /* We probably want the model to 
           * load this for us
           */
          return this.set(post, { silent: true })
        }
        var data = this._mapPost(post)
        this.set(data, { silent: true })
        this.requestCommentCount()
      },

      requestCommentCount: function() {
        var self = this
        var options = {
          node: this.get('node'),
          id: this.get('localId'),
          rsm: { max: 1 }
        }

        socket.send('xmpp.buddycloud.items.replies', options, function(error, data, rsm) {
          if (error) {
            return self.trigger('error', error)
          }
          self.set({ commentCount: rsm.count || 0 })
        })
      },

      sync: function(method, collection, options) {
        if (!method) {
          method = 'get'
        }
        
        switch (method) {
          case 'get':
            return this.getPost()
          case 'post':
          case 'create':
            return this.publish()
          default:
            throw new Error('Unhandled method: ' + method)
        }
            
      },

      getPost: function() {
        var event = this.xmppEvents['get']
        var self = this
        var options = {
          node: this.get('node'),
          id: this.get('localId')
        }
        socket.send(event, options, function(error, post) {
          if (error) {
            return self.trigger('error', error)
          }
          self.set(self._mapPost(post[0]), { silent: true })
          self.trigger('loaded:post')
        })
      },

      publish: function() {
        var payload = {
            node: this.get('node'),
            content: {
              atom: {
                content: this.get('content')
            },
            'in-reply-to': { ref: this.get('inReplyTo') }
          }
        }
        var self = this
        var event = this.xmppEvents['post']
        socket.send(event, payload, function(error, success) {
          if (error) {
            return self.trigger('publish:error', error)
          }
          self.trigger('publish:success')
        })
      },

      _mapPost: function(post) {
        var isComment = ('comment' === post.entry.activity.object['object-type'])
        var author = post.entry.atom.author.uri.substr(5)
        var username = author
        var usernameParts = author.split('@')
        if (usernameParts[1] === localStorage.getItem('jid').split('@')[1]) {
          username = usernameParts[0]
        }
        var isModerator = config.admins.indexOf(username) >= 0

        return {
          displayName: null,
          username: username,
          authorJid: author,
          published: Date.parse(post.entry.atom.published),
          content: this.parseContent(post.entry.atom.content.content, isComment, isModerator),
          unparsedContent: post.entry.atom.content.content,
          node: post.node,
          channelJid: post.node.split('/')[2],
          globalId: post.entry.atom.id,
          localId: post.entry.atom.id.split(',')[2] || post.entry.atom.id,
          canComment: true,
          isComment: isComment,
          inReplyTo: isModerator,
          likes: 1,
          isModerator: config.admins.indexOf(username) >= 0,
          commentCount: null
        }
      },

      parseContent: function(content, isComment, isModerator) {
        content = _.escape(content)
          .replace(/\{/g, '&#123;')
          .replace(/&#x2F;/g, '/')
          .replace(/\}/g, '&#125;')
          .replace(/\n/g, '<br>')

        if (!isComment || (isComment && isModerator)) {
          this.embedReceipts.forEach(function(receipt) {
            content = content.replace(receipt.regex, receipt.substitution)
          }, this)
        }

        return content
      },

      addComment: function() {
        this.set('commentCount', this.attributes.commentCount + 1)
      },

      removeComment: function() {
        this.set(
          'commentCount',
          (this.attributes.commentCount > 0) ? this.attributes.commentCount - 1 : 0
        )
      }
      
    })

})
