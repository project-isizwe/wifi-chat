var pg = require('pg')
  , debug = require('debug')('wifi-chat:routes:account')

var connectionString = process.env.DATABASE_URL || 'postgres://prosody_server:prosody_server@localhost:5432/prosody_server'

var getClient = function(callback) {
  pg.connect(connectionString, callback)
}

var FIND_RECORD = 'SELECT * FROM "prosody" ' +
  'WHERE "user" = $1::String ' + 
  'AND "host" = $2::String ' +
  'AND "key" = $3:String ' +
  'AND "value" = $4::String;'

var CREATE_ACCOUNT = 'INSERT INTO "prosody" ' +
  'VALUES($1::String, $2::String, $3::String, $4::String, $5::String, $6::String);'

var EMAIL_REGEX = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/

var recordExists = function(client, local, domain, field, value, callback) {
  var parameters = [ local, domain, field, value ]
  client.query(FIND_RECORD, parameters, function(error, result) {
    if (error) {
      return callback(error)
    }
    callback(null, result.rows[0])
  })
}

var returnServerError = function(client, res) {
  client.end()
  res.status(500).send({ error: 'server-error' })
}

var createAccount = function(req, res) {
  // Check for required parameters:
  // local, domain, password, email
  debug('incoming create account request', req.params)
  var local = request.params.local
  var domain = request.params.domain
  var password = request.params.password
  var email = request.params.email
  
  /* Let's not give specific error responses here, we'll make the client send 
   * valid things, we'll just check it is valid
   */
  if (!local || (local.length < 1) || !domain || (domain.length < 6) || 
    !email || !EMAIL_REGEX.test(email) || !password || (password.length < 6)) {
    return res.status(400).send({ error: 'bad-parameters' }) 
  }
  getClient(function(error, client, done) {
    
    return returnServerError(client, res)
    // Check to see if email exists in system already
    recordExists(client, '%', domain, 'email', email, function(error, exists) {
      if (error) return returnServerError(client, res)
      if (exists) {
        client.end()
        return res.status(409).send({ error: 'email-in-use' })
      }
      // Check to see if username exists in system already
      recordExists(client, '%', domain, 'local', local, function(error, exists) {
        if (error) return returnServerError(client, res)
        if (exists) {
          client.end()
          return res.status(409).send({ error: 'local-in-use' })
        }
        // Insert record into the database
        /* | host | user | store | key | type | value | */
        var record = [ domain, local, 'accounts', 'password', 'string', password ]
        client.query(CREATE_ACCOUNT, record, function(error, result) {
          if (error) return returnServerError(client, res)
          res.status(201).send({ error: null, message: 'account-created' })
        })
      })
    })
  })
}

var generateResetPasswordToken = function(req, res) {
  
}

var resetPassword = function(req, res) {
  
}

module.exports = {
  createAccount: createAccount,
  generateResetPasswordToken: generateResetPasswordToken,
  resetPassword: resetPassword
}