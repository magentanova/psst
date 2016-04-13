// es5, 6, and 7 polyfills, powered by babel
import polyfill from "babel-polyfill"

//
// fetch method, returns es6 promises
// if you uncomment 'universal-utils' below, you can comment out this line
import fetch from "isomorphic-fetch"

// universal utils: cache, fetch, store, resource, fetcher, router, vdom, etc
// import * as u from 'universal-utils'

// the following line, if uncommented, will enable browserify to push
// a changed fn to you, with source maps (reverse map from compiled
// code line # to source code line #), in realtime via websockets
// -- browserify-hmr having install issues right now
// if (module.hot) {
//     module.hot.accept()
//     module.hot.dispose(() => {
//         app()
//     })
// }

// Check for ServiceWorker support before trying to install it
// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('./serviceworker.js').then(() => {
//         // Registration was successful
//         console.info('registration success')
//     }).catch(() => {
//         console.error('registration failed')
//             // Registration failed
//     })
// } else {
//     // No ServiceWorker Support
// }

import DOM from 'react-dom'
import React, {Component} from 'react'
import Backbone from 'bbfire'
import Firebase from 'firebase'
import {SplashPage,DashPage,CliqView} from './views'
import ref from './fbRef'
import {Models,Collections} from './models'

// // collection that will sync with a specific user's "messages" schema
// var UserMessages = Backbone.Firebase.Collection.extend({
//     initialize: function(uid) {
//         this.url = `http://hushhush.firebaseio.com/users/${uid}/messages`
//     }
// })


function app() {
    // start app
    // new Router()
    var PsstRouter = Backbone.Router.extend({
        routes: {
            addcliq: "showCliqAdder",
            mycliq: "showMyCliq",
            'splash': "showSplashPage",
            'dash': "showDashboard",
            'logout': "doLogOut"
        },

        initialize: function() {

            if (!ref.getAuth()) {
                location.hash = "splash"
            }

            this.on('route', function() {
                if (!ref.getAuth()) {
                    location.hash = "splash"
                }
            })
        },

        showCliqAdder: function() {
            DOM.render(<DashPage view="add" />, document.querySelector('.container'))
        },

        showMyCliq: function() {
            var myMod = new Models.UserModel(ref.getAuth().uid)
            myMod.once('sync',function() {
                var cliqId = myMod.get('cliq_id')
                var usersInCliq = new Collections.UsersByCliqId(cliqId)
                var secretsInCliq = new Collections.SecretsByCliqId(cliqId)
                DOM.render(<CliqView cliqId={cliqId} secretsColl={secretsInCliq} peepsColl={usersInCliq}/>, document.querySelector('.container'))                
            })
        },

        doLogOut: function() {
            ref.unauth()
            location.hash = "splash"
        },

        showSplashPage: function() {
            console.log('splish splash!')
            DOM.render(<SplashPage logUserIn={this._logUserIn.bind(this)} createUser={this._createUser.bind(this)} />, document.querySelector('.container'))
        },

        showDashboard: function() {
            var uid = ref.getAuth().uid
            DOM.render(<DashPage />,document.querySelector('.container'))
        },

        _logUserIn: function(email,password){
            console.log(email,password)
            ref.authWithPassword({
                email: email,
                password: password
            }, function(err,authData) {
                if (err) console.log(err)
                else {
                    location.hash = "dash"
                }
              }
            )
        },

        _createUser: function(email,password,realName) {
            console.log(email, password)
            var self = this
            ref.createUser({
                email: email,
                password: password,
            },function(error,authData) {
                if (error) console.log(error)
                else {
                    var userMod = new UserModel(authData.uid)
                    userMod.set({
                        name: realName, 
                        email:email,
                        id: authData.uid
                    })  
                    self._logUserIn(email,password) 
                }
            })
        }
    })

    var pr = new PsstRouter()
    Backbone.history.start()
}

app()
