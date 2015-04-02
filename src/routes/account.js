var pg = require('pg')
  , crypto = require('crypto')
  , debug = require('debug')('wifi-chat:routes:account')
  , mailer = require('../mailer')
  , fs = require('fs')

var passwordResetTemplate = fs.readFileSync(
  process.cwd() + '/src/templates/password-reset',
  'utf8'
)

var connectionString = process.env.DATABASE_URL || 'postgres://prosody_server:Ied8eichOasheil0@localhost:5432/prosody_server'

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

var INSERT_TOKEN = 'INSERT INTO "password-tokens" VALUES ($1, $2, $3, NOW());'

var CLEAN_TOKENS = 'DELETE FROM "password-tokens" WHERE "expires" < NOW();'

var EMAIL_REGEX = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/

var config = null

var findRecord = function(client, local, domain, field, value, callback) {
  var parameters = [ local, domain, field, value ]
  client.query(FIND_RECORD, parameters, function(error, result) {
    if (error) {
      return callback(error)
    }
    callback(null, result.rows[0])
  })
}

var returnServerError = function(client, res, reason) {
  if (client) client.end()
  debug('Account action failed: ' + reason)
  res.status(500).send({ error: 'server-error' })
}

var setConfig = function(configuration) {
  config = configuration
  mailer.setConfig(config)
}

var createAccount = function(req, res) {
  // Check for required parameters:
  // local, domain, password, email
  debug('incoming create account request', req.body)
  var local = (req.body.local || '').trim()
  var domain = (req.body.domain || '').trim()
  var password = (req.body.password || '').trim()
  var email = (req.body.email || '').trim()
  
  /* Let's not give specific error responses here, we'll make the client send 
   * valid things, we'll just check it is valid
   */
  if (!local || (local.length < 1) || !domain || (domain.length < 6) ||
      (-1 === config.allowedDoamins.indexOf(domain)) ||
    !email || !EMAIL_REGEX.test(email) || !password || (password.length < 6)) {
    return res.status(400).send({ error: 'bad-parameters' }) 
  }
  getClient(function(error, client, done) {
    if (error) return returnServerError(client, res, 'Failed to get DB connection')
    // Check to see if email exists in system already
    findRecord(client, '%', domain, 'email', email, function(error, exists) {
      if (error) return returnServerError(client, res, 'Failed to check for email')
      if (exists) {
        client.end()
        return res.status(409).send({ error: 'email-in-use' })
      }
      // Check to see if username exists in system already
      findRecord(client, '%', domain, 'local', local, function(error, exists) {
        if (error) return returnServerError(client, res, 'Failed to check for account')
        if (exists) {
          client.end()
          return res.status(409).send({ error: 'local-in-use' })
        }
        // Insert record into the database
        var record = [ domain, local, 'accounts', 'password', 'string', password ]
        client.query(CREATE_ACCOUNT, record, function(error, result) {
          if (error) return returnServerError(client, res, 'Failed to add new account')
          record[3] = 'email'
          record[5] = email
          client.query(CREATE_ACCOUNT, record, function(error, result) {
            if (error) return returnServerError(client, res, 'Failed to add email')
            client.end()
            res.status(201).send({ error: null, message: 'account-created' })
          })
        })
      })
    })
  })
}

var generateResetPasswordToken = function(req, res) {
  debug('Incoming password reset request', req.body)
  var email = (req.body.email || '').trim()
  
  /* Let's not give specific error responses here, we'll make the client send 
   * valid things, we'll just check it is valid
   */
  if (!email || !EMAIL_REGEX.test(email)) {
    return res.status(400).send({ error: 'bad-parameters' }) 
  }
  getClient(function(error, client, done) {
    if (error) return returnServerError(client, res, 'Failed to get DB connection')
    findRecord(client, '%', '%', 'email', email, function(error, record) {
      if (error) return returnServerError(client, res, 'Failed at getting record')
      if (!record) {
        debug('No entry found for ' + email)
        return res.status(200).send({ error: null, message: 'done' })
      }
      debug('record', record)
      crypto.randomBytes(48, function(ex, buf) {
        var token = buf.toString('hex')
        var parameters = [ token, record.host, record.user ]
        client.query(INSERT_TOKEN, parameters, function(error) {
          if (error) return returnServerError(client, res, 'Error inserting token')
          var mailSent = function(error, message) {
            if (error) return returnServerError(client, res, error)
            client.end()
            res.status(200).send({ error: null, message: 'done' })
          }
          mailer.sendMail(
            email,
            'Password reset request',
            passwordResetTemplate,
            { token: token },
            mailSent
          )
        })
      })
    })
  })
}

var resetPassword = function(req, res) {
  
}

module.exports = {
  createAccount: createAccount,
  generateResetPasswordToken: generateResetPasswordToken,
  resetPassword: resetPassword,
  setConfig: setConfig
}