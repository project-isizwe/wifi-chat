module.exports = {
  /* Which domain does this client handle - only affects account features
   *                                        and appends JIDs automatically
  domain: 'buddycloud.dev',
  
  /* Used for emails */
  url: 'http://localhost:3000', 
  
  email: {
    /* Which address to send emails from */
    sendAddress: 'noreply@buddycloud.dev',
    reportingAddress: 'report@buddycloud.dev',
    /* Connection details */
    connection: {
      user: 'user',
      password: 'password',
      host: 'host',
      port: 'port', /* if not provided standard port used */
      ssl: 'ssl',  /* boolean or object {key, ca, cert} (if true or object, ssl connection will be made) */
      tls: true, /* boolean or object (if true or object, starttls will be initiated) */
      timeout: 5000 /* max number of milliseconds to wait for smtp responses (defaults to 5000) */
    }
  },
  zendesk: {
    api: 'https://wifichat.zendesk.com/api/v2/',
    token: 'MSvdPvcl4cQnJD6r8sun4DhhRtaL7VACYG6DCYr4' 
  },
  admins: ['admin'] /* list of usernames with admin privileges */
}
