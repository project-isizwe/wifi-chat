define(function(require) {

    'use strict';

    var socket = new Primus('//' + window.document.location.host)
    return socket
})
    