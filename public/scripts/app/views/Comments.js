define(function(require) {

    'use strict';

    var _                   = require('underscore')
      , Base                = require('app/views/Base')
      , socket              = require('app/utils/socket')
      , log                 = require('app/utils/bows.min')('Views:Comments')

    return Base.extend({

        template: _.template(require('text!tpl/Comments.html')),
      
        requiresLogin: true,
      
        className: 'comments screen'
    })

})
