'use strict';

var zendesk = require('node-zendesk')
  , db      = require('./database')
  , debug   = require('debug')('wifi-chat:fault')

var config = null

var setConfig = function(configuration) {
  config = configuration
}

var getClient = function() {
  var client = zendesk.createClient(config.zendesk)
  return client
}

var sendReport = function(data, callback) {
  if (!data || !data.description || !data.category) {
    return callback({ error: 'bad-parameters' })
  }
	var faultClient = getClient()
  db.getClient(function(error, client, done) {
    if (error) {
      db.endClient(client)
      return callback({ error: 'server-error' })
    }
    db.getUserEmail(client, data.username, function(error, result) {
      if (error) {
        debug('Failed to get user email', error)
        return callback({ error: 'server-error' })
     }
      data.email = result.rows[0].value
      done()
      /**
       * Find field => ID mapping via source @ 
       * https://wifichat.zendesk.com/agent/admin/ticket_fields
       */
      var ticket = {
        ticket: {
          type: 'problem',
          subject: 'User has reported an incident',
          comment: { body: data.description },
          custom_fields: [
            { /* username */ id: 27161401, value: data.username },
            { /* email */ id: 27192212, value: data.email },
            { /* category */ id: 27191502, value: data.category },
            { /* sub-category */ id: 27523441, value: data.subCategory },
            { /* description */ id: 27185632, value: data.description },
            { /* ID number */ id: 27515511, value: data.idNumber }
          ],
          requester: {
            name: data.username,
            email: data.email
          }
        }
      }

      if (typeof data.location != undefined) {
        ticket.ticket.custom_fields.push({
          /* latitude */
          id:  27191342,
          value: data.location.lat
        })
        ticket.ticket.custom_fields.push({
          /* longtitude */
          id: 27191652,
          value: data.location.lng
        })
      }
      debug('Posting ticket', ticket)
      faultClient.tickets.create(ticket,  function(error, req, result) {
        if (error) {
          debug('Failed to create ticket', error)
          return callback({ error: 'failed-to-create-ticket' })
        }
        callback()
      })
    })
  })
}

module.exports = {
  sendReport: sendReport,
  setConfig: setConfig
}
