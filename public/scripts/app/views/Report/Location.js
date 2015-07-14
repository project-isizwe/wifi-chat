define(function(require) {

    'use strict';

    var _                 = require('underscore')
      , Base              = require('app/views/Base')
      , ReportDescription = require('app/views/Report/Description')
      , log               = require('bows.min')('Views:Report:Map')

    return Base.extend({

      template: _.template(require('text!tpl/Report/Location.html')),

      requiresLogin: true,

      title: 'Pick Location',

      className: 'report screen',

      events: {
        'click .js-confirm': 'confirmLocation'
      },

      // fallback location: pretoria center
      fallbackLocation: {
        lat: -25.7461360925002,
        lon: 28.188482544738818
      },

      initialize: function(options) {
        this.model = options.model
        this.router = options.router
      },

      afterRender: function() {
        // initialize google maps
        var self = this
        var mapOptions = {
          zoom: 17,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          streetViewControl: false
        }

        // we already have a location because the user went back history
        if (this.model.get('location')) {
          var currentLocation = this.model.get('location')
          mapOptions.center = new google.maps.LatLng(currentLocation.lat, currentLocation.lng)
          mapOptions.zoom = this.model.get('zoom')
        }

        // initialize map
        var mapElement = this.$('.js-map')
        mapElement.addClass('is-active')
        this.map = new google.maps.Map(mapElement.get(0), mapOptions)

        // no location - lets detect the users location
        if (!this.model.get('location')) {
          // Try W3C Geolocation (Preferred)
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
              var initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
              self.map.setCenter(initialLocation)
            }, function() {
              self.handleNoGeolocation()
            })
          } else {
            /* Browser doesn't support Geolocation */
            this.handleNoGeolocation()
          }
        }

        /*
         * hide address bar on mobile devices
         *
         * http://stackoverflow.com/questions/4117377/how-to-hide-the-address-bar-on-iphone
        */ 
        /Mobile/.test(navigator.userAgent) && setTimeout(function () {
            if (!pageYOffset) window.scrollTo(0, 1);
        }, 1000);
      },

      handleNoGeolocation: function() {
        var fallback = new google.maps.LatLng(this.fallbackLocation.lat, this.fallbackLocation.lon)
        this.map.setZoom(15)
        this.map.setCenter(fallback)
      },

      confirmLocation: function(event) {
        if (!this.map) {
          return this.onMapsError()
        }
        this.model.set('location', {
          lat: this.map.getCenter().lat(),
          lng: this.map.getCenter().lng()
        })
        this.model.set('zoom', this.map.getZoom())
        this.router.showReportDescription(this.model)
      }

    })

})
