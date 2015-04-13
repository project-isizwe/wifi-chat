define(function(require) {

    'use strict';

    var _                   = require('underscore')
      , Base                = require('app/views/Base')
      , socket              = require('app/utils/socket')
      , log                 = require('bows.min')('Views:Activity')

    return Base.extend({

        template: _.template(require('text!tpl/Activity.html')),
      
        requiresLogin: true,

        title: 'Activity',
      
        className: 'tab-views-item activity',

        attributes: {
          'data-view': 'activity'
        }
    })

})
