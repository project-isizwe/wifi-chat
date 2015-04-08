define(function(require) {

    'use strict';

    var _                   = require('underscore')
      , Base                = require('app/views/Base')
      , log                 = require('app/utils/bows.min')('Views:Topic:NewComment')

    return Base.extend({

        template: _.template(require('text!tpl/Channel/Topic/NewComment.html')),
      
        requiresLogin: true

    })

})
