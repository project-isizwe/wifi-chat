define(function(require) {

    'use strict';

    var _                   = require('underscore')
      , Base                = require('app/views/Base')
      , socket              = require('app/utils/socket')
      , log                 = require('app/utils/bows.min')('Views:Settings')

    return Base.extend({

        template: _.template(require('text!tpl/Settings.html')),
      
        requiresLogin: true,

        title: 'Settings',
      
        className: 'tab-views-item settings',

        attributes: {
          'data-view': 'settings'
        }
    })

})
