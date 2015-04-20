define(function(require) {

  'use strict';
  
  var Avatar   = require('app/models/Avatar')
    , log      = require('bows.min')('Collections:Avatars')
    , socket   = require('app/utils/socket')
    
  return Backbone.Collection.extend({
    
    model: Avatar,

    max: 50,

    comparator: 'lastUse',

    getAvatar: function(options) {
      var avatar = this.findWhere({ jid: options.jid })

      if (avatar) {
        avatar.set('lastUse', Date.now())
        return avatar
      } else {
        return this.addNew(options)
      }
    },

    addNew: function(options) {
      // keep store tidy
      if (this.length > this.max) {
        this.sort()
        this.remove(this.at(0))
      }
      return this.add(_.extend(options, { 'lastUse': Date.now() }))
    }
    
  })
    
})