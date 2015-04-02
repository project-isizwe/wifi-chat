module.exports = {
  allowedDoamins: [ 'buddycloud.dev', 'example.com' ],
  
  email: {
    connection: {
      user: 'user',
      password: 'password',
      host: 'host',
      port: 'port', /* if not provided standard port used */
      ssl: 'ssl',  /* boolean or object {key, ca, cert} (if true or object, ssl connection will be made) */
      tls: true, /* boolean or object (if true or object, starttls will be initiated) */
      timeout: 5000 /* max number of milliseconds to wait for smtp responses (defaults to 5000) */
    }
  }
}