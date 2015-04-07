define(function(require) {

    'use strict';

    var _                   = require('underscore')
      , Base                = require('app/views/Base')
      , socket              = require('app/utils/socket')
      , log                 = require('app/utils/bows.min')('Views:Channel')

    return Base.extend({

        template: _.template(require('text!tpl/Channel.html')),
      
        requiresLogin: true,
      
        className: 'channel screen',
      
        initialize: function(options) {
          var self = this

          this.options = options
          this.router = options.router
        }
    })

})
