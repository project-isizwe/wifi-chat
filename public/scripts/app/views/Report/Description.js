define(function(require) {

    'use strict';

    var _                = require('underscore')
      , Base             = require('app/views/Base')
      , autosize         = require('autosize')
      , Thankyou         = require('app/views/Report/Thankyou')
      , File             = require('app/models/File')
      , user             = require('app/store/User')
      , log              = require('bows.min')('Views:Report:Description')

    return Base.extend({

      template: _.template(require('text!tpl/Report/Description.html')),

      requiresLogin: true,

      title: 'Add Description',

      className: 'report screen',

      events: {
        'submit form': 'send',
        'click .js-back': 'back'
      },

      initialize: function(options) {
        this.options = options
        this.router = options.router
        if (localStorage.uploads && window.File && window.FileReader && window.FileList && window.Blob) {
          this.model.set('canUploadFiles', true)
          this.file = new File({ jid: user.get('channelJid') })
        } else {
          log('The File APIs are not fully supported in this browser.')
          this.model.set('canUploadFiles', false)
        }
      },

      afterRender: function() {
        this.input = this.$('.js-description')
        autosize(this.input)
      },

      send: function(event) {
        event.preventDefault()
        this.showSpinner('Sending Report')
        if (!this.file) {
          return this.sendReport()
        }
        this.file.on('error:file', function(message) {
          this.error(message)
        }, this)
        this.file.on('change:id', function(url) {
          log('success', arguments)
          this.sendReport()
        }, this)
        this.file.upload(event)

      },

      sendReport: function(error) {
        this.model.set('description', this.$('.js-description').val())

        if ('home' === this.model.get('category')) {
          this.model.set(
            'idNumber',
            this.$('.js-municipal-account-number').val()
          )
        }

        // also upload photo(s) from this.$('.js-photos').val()

        log('Attempting to create a ticket', this.model)
        this.model.once('ticket:success', _.bind(this.success, this))
        this.model.once('ticket:error', _.bind(this.error, this))
        this.model.save()
        
      },

      error: function(error) {
        this.closeSpinner()
        this.showError(
          'Unfortunately we couldn\'t post your report. ' +
          'Please try again later.'
        )
      },

      success: function() {
        this.closeSpinner()
        log('Ticket created successfully')
        var thankyouView = new Thankyou(this.options)
        this.router.showView(thankyouView)
      },

      back: function(event) {
        /* overwrite the back buttons default behaviour
         * in order to hand over the report state
         */
        event.stopPropagation()
        this.router.showReportLocation(this.model)
      },

      onDestroy: function() {
        this.triggerAutosizeEvent('autosize.destroy')
      },

      triggerAutosizeEvent: function(event) {
        var evt = document.createEvent('Event');
        evt.initEvent(event, true, false);
        this.input.get(0).dispatchEvent(evt);
      },

    })

})
