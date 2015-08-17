define(function(require) {

    'use strict';

    var _                = require('underscore')
      , Base             = require('app/views/Base')
      , autosize         = require('autosize')
      , Thankyou         = require('app/views/Report/Thankyou')
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

      afterRender: function() {
        this.input = this.$('.js-description')
        autosize(this.input)
      },

      send: function(event) {
        event.preventDefault()
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
        this.showSpinner('Sending Report')
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
