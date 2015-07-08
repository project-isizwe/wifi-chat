define(function(require) {

    'use strict';

    var _                = require('underscore')
      , Base             = require('app/views/Base')

    return Base.extend({

      template: _.template(require('text!tpl/Report/Emergency.html')),

      requiresLogin: true,

      title: 'Emergency',

      className: 'report screen'

    })

})
