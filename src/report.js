var mailer = require('./mailer')
  , fs = require('fs')

var postReportTemplate = fs.readFileSync(
  process.cwd() + '/src/templates/post-report',
  'utf8'
)

var config = null

var setConfig = function(configuration) {
  config = configuration
}

var sendReport = function(data, callback) {
	
  if (
    !data.content ||
    !data.postId ||
    !data.channel ||
    !data.author
  ) {
    /* We'll just ignore errors */
    return callback()
  }
  var replacements = {
    postId: data.postId,
    channel: data.channel,
    author: data.author,
    reportedBy: data.reportedBy,
    reason: data.reason || '...None provided...',
    content: data.content
  }
  mailer.sendMail(
    config.email.reportingAddress,
    'Post on wifi chat being reported',
    postReportTemplate, 
    replacements,
    function() { callback() }
  )
}

module.exports = {
  sendReport: sendReport,
  setConfig: setConfig
}