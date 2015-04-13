define(function(require) {

    'use strict';

    var _           = require('underscore')
      , Base        = require('app/views/Base')
      , log         = require('bows.min')('Views:Welcome')

    return Base.extend({

        template: _.template(require('text!tpl/Welcome.html')),
      
        className: 'welcome screen',

        title: 'WiFi Chat',

    })

})
