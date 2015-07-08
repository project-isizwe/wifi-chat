define(function(require) {

    'use strict';

    var _                = require('underscore')
      , Base             = require('app/views/Base')
      , config           = require('app/utils/config')
      , log              = require('bows.min')('Views:Report:Map')
      , googleMaps       = require(['async!https://maps.googleapis.com/maps/api/js?key='+config.googleMapsApiKey])

    return Base.extend({

      template: _.template(require('text!tpl/Report/Map.html')),

      requiresLogin: true,

      title: 'Pick Location',

      className: 'report screen',

      events: {
        'click .js-confirm': 'confirmLocation'
      },

      initialize: function(options) {
        this.options = options
        this.router = options.router
        this.pretoria = new google.maps.LatLng(-25.7461360925002, 28.188482544738818);
      },

      afterRender: function() {
        // initialize google maps
        var self = this
        var myOptions = {
          zoom: 17,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          streetViewControl: false
        }
        this.map = new google.maps.Map($('.js-map').get(0), myOptions)

        // Try W3C Geolocation (Preferred)
        if(navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
            var initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
            self.map.setCenter(initialLocation)
          }, function() {
            self.handleNoGeolocation()
          })
        }
        // Browser doesn't support Geolocation
        else {
          this.handleNoGeolocation()
        }
      },

      handleNoGeolocation: function() {
        this.map.setZoom(15)
        this.map.setCenter(pretoria)
      },

      confirmLocation: function(event) {
        this.model.set('location', this.map.getCenter())
      }

    })

})
