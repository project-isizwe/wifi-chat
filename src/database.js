'use strict';

var pg = require('pg')

var connectionString = process.env.DATABASE_URL || 'postgres://prosody_server:secret_for_prosody_server@localhost:5432/prosody_server'

var getClient = function(callback) {
  pg.connect(connectionString, callback)
}

var FIND_RECORD = 'SELECT * FROM prosody ' +
  'WHERE "user" LIKE $1 ' + 
  'AND "host" LIKE $2 ' +
  'AND "key" LIKE $3 ' +
  'AND "value" LIKE $4 ' +
  'LIMIT 1;'

var CREATE_ACCOUNT = 'INSERT INTO "prosody" ' +
  'VALUES($1, $2, $3, $4, $5, $6);'

var INSERT_TOKEN = 'INSERT INTO "password-tokens" ' +
  'VALUES ($1, $2, $3, NOW() + \'1 day\'::INTERVAL);'

var CLEAN_TOKENS = 'DELETE FROM "password-tokens" WHERE "expires" < NOW();'

var CLEAN_USER_TOKENS = 'DELETE FROM "password-tokens" ' +
    'WHERE "host" = $1 AND "local" = $2;'

var GET_TOKEN = 'SELECT * FROM "password-tokens" WHERE "token" = $1 LIMIT 1;'

var UPDATE_PASSWORD = 'UPDATE "prosody" SET "value" = $1 ' +
    'WHERE "user" = $2 AND "host" = $3 AND "key" = \'password\';';

var EMAIL_REGEX = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/

var findRecord = function(client, local, domain, field, value, callback) {
  var parameters = [ local, domain, field, value ]
  client.query(FIND_RECORD, parameters, function(error, result) {
    if (error) {
      return callback(error)
    }
    callback(null, result.rows[0])
  })
}

var insertToken = function(client, parameters, callback) {
  client.query(INSERT_TOKEN, parameters, callback)
}

var cleanTokens = function(client, callback) {
  client.query(CLEAN_TOKENS, [], callback)
}

var getToken = function(client, token, callback) {
  client.query(GET_TOKEN, [ token ], callback)
}

var updatePassword = function(client, parameters, callback) {
  client.query(UPDATE_PASSWORD, parameters, callback)
}

var cleanTokens = function(client, parameters, callback) {
  client.query(CLEAN_USER_TOKENS, parameters, callback)
}

var endClient = function(client) {
  client.end()
}

var addAccountRecord = function(client, record, callback) {
  client.query(CREATE_ACCOUNT, record, callback)
}

module.exports = {
  findRecord: findRecord,
  getClient: getClient,
  insertToken: insertToken,
  cleanTokens: cleanTokens,
  getToken: getToken,
  updatePassword: updatePassword,
  cleanTokens: cleanTokens,
  endClient: endClient,
  addAccountRecord: addAccountRecord
}