define(function (require) {

    'use strict';

    var $         = require('jquery'),
        Backbone  = require('backbone'),
        LoginView = require('app/views/Login'),

        loginView = new LoginView()

    return Backbone.Router.extend({

        routes: {
            '': 'home',
            'channels': 'channelList',
            'channel/:jid': 'channelContent',
            'profile/:jid': 'userProfile'
        },

        home: function () {
            loginView.delegateEvents()
            slider.slidePage(loginView.$el)
        },
      
        channelList: function() {
          
        },

        channelContent: function (id) {
            require(['app/models/thread', 'app/views/Channels'], function (models, EmployeeView) {
                var employee = new models.Employee({id: id})
                employee.fetch({
                    success: function (data) {
                        slider.slidePage(new EmployeeView({ model: data }).$el)
                    }
                })
            })
        },

        userProfile: function (id) {
            require(['app/models/employee', 'app/views/Reports'], function (models, ReportsView) {
                var employee = new models.Employee({id: id})
                employee.fetch({
                    success: function (data) {
                        slider.slidePage(new ReportsView({ model: data }).$el)
                    }
                })
            })
        }

    })

})