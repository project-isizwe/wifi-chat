var crypto = require('crypto')
  , debug = require('debug')('wifi-chat:routes:account')
  , mailer = require('../mailer')
  , fs = require('fs')
  , StringPrep = require('node-stringprep').StringPrep
  , db = require('../database')

var stringPrep = new StringPrep('nameprep')
  , config = null

var passwordResetTemplate = fs.readFileSync(
  process.cwd() + '/src/templates/password-reset',
  'utf8'
)

var returnServerError = function(client, res, reason) {
  if (client) db.endClient(client)
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
  var local = stringPrep.prepare((req.body.local || '').trim())
  var domain = (req.body.domain || '').trim()
  var password = (req.body.password || '').trim()
  var email = (req.body.email || '').trim().toLowerCase()

  /* Let's not give specific error responses here, we'll make the client send 
   * valid things, we'll just check it is valid
   */
  var pattern = /^[a-z0-9\-\.]{3,}$/
  if (!local || !pattern.test(local) || !domain || (domain.length < 6) ||
      (domain !== config.domain) ||
    !email || !EMAIL_REGEX.test(email) || !password || (password.length < 6)) {
    return res.status(400).send({ error: 'bad-parameters' })
  }
  db.getClient(function(error, client, done) {
    if (error) return returnServerError(client, res, 'Failed to get DB connection')
    // Check to see if email exists in system already
    db.findRecord(client, '%', domain, 'email', email, function(error, exists) {
      if (error) return returnServerError(client, res, 'Failed to check for email')
      if (exists) {
        db.endClient(client)
        return res.status(409).send({ error: 'email-in-use' })
      }
      // Check to see if username exists in system already
      db.findRecord(client, '%', domain, 'local', local, function(error, exists) {
        if (error) return returnServerError(client, res, 'Failed to check for account')
        if (exists) {
          db.endClient(client)
          return res.status(409).send({ error: 'local-in-use' })
        }
        // Insert record into the database
        var record = [ domain, local, 'accounts', 'password', 'string', password ]
        db.addAccountRecord(record, function(error, result) {
          if (error) return returnServerError(client, res, 'Failed to add new account')
          record[3] = 'email'
          record[5] = email
          db.addAccountRecord(client, record, function(error, result) {
            if (error) return returnServerError(client, res, 'Failed to add email')
            db.endClient(client)
            res.status(201).send({ error: null, message: 'account-created' })
          })
        })
      })
    })
  })
}

var generateResetPasswordToken = function(req, res) {
  debug('Incoming password reset request', req.body)
  var email = (req.body.email || '').trim().toLowerCase()
  
  /* Let's not give specific error responses here, we'll make the client send 
   * valid things, we'll just check it is valid
   */
  if (!email || !EMAIL_REGEX.test(email)) {
    return res.status(400).send({ error: 'bad-parameters' }) 
  }
  db.getClient(function(error, client, done) {
    if (error) return returnServerError(client, res, 'Failed to get DB connection')
    db.findRecord(client, '%', '%', 'email', email, function(error, record) {
      if (error) return returnServerError(client, res, 'Failed at getting record')
      if (!record) {
        debug('No entry found for ' + email)
        return res.status(200).send({ error: null, message: 'done' })
      }
      crypto.randomBytes(24, function(ex, buf) {
        var token = buf.toString('hex')
        var parameters = [ token, record.host, record.user ]
        db.insertToken(client, parameters, function(error) {
          if (error) return returnServerError(client, res, 'Error inserting token')
          var mailSent = function(error, message) {
            if (error) return returnServerError(client, res, error)
            db.endClient(client)
            res.status(200).send({ error: null, message: 'done' })
          }
          mailer.sendMail(
            email,
            'Password reset request',
            passwordResetTemplate,
            { token: token, username: record.user },
            mailSent
          )
        })
      })
    })
  })
}

var resetPassword = function(req, res) {
   // Check e have a valid token and password
  debug('Incoming new password set request', req.body, req.params.token)
  var password = (req.body.password || '').trim()
  var token = req.params.token
  
  if (!password || (password.length < 6) || !token) {
    return res.status(400).send({ error: 'bad-parameters' })
  }
  // Clean down expired tokens
  db.getClient(function(error, client, done) {
    if (error) return returnServerError(client, res, 'Failed to get DB connection')
    db.purgeTokens(client, function(error) {
      if (error) return returnServerError(client, res, 'Error cleaning expired tokens')
        db.getToken(client, token, function(error, result) {
         if (error) return returnServerError(client, res, 'Failed to load token')
         if (0 === result.rowCount) {
           db.endClient(client)
           return res.status(404).send({ error: 'token-not-found' })
         }
         var params = [ password, result.rows[0].local, result.rows[0].host ]
         db.updatePassword(client, params, function(error) {
           if (error) return returnServerError(client, res, 'Error updating password')
           res.status(200).send({ error: null, message: 'password-updated' })
           params = [ result.rows[0].host, result.rows[0].local ]
           db.cleanUserTokens(client, params, function(error) {
             debug('Error cleaning user tokens', error)
             db.endClient(client)
           })
           
         })

         
       })
    })
  })
}

module.exports = {
  createAccount: createAccount,
  generateResetPasswordToken: generateResetPasswordToken,
  resetPassword: resetPassword,
  setConfig: setConfig
}