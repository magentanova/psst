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
// window.BB = Backbone

var ref = new Firebase("http://hushhush.firebaseio.com")

Backbone.Firebase.Model.prototype.fetchWithPromise = Backbone.Firebase.Collection.prototype.fetchWithPromise = function() {
    this.fetch()
    var self = this
    var p = new Promise(function(res,rej){
        self.once('sync',function() {
            res()
        })
        self.once('err',function() {
            rej()
        })
    })
    return p
}

var UserModel = Backbone.Firebase.Model.extend({
    initialize: function(uid) {
        this.url = `http://hushhush.firebaseio.com/users/${uid}`
    }
})

var QueryByEmail = Backbone.Firebase.Collection.extend({
    initialize: function(targetEmail) {
        this.url = ref.child('users').orderByChild('email').equalTo(targetEmail)
    },
    autoSync: false
})

// collection that will sync with a specific user's "messages" schema
var UserMessages = Backbone.Firebase.Collection.extend({
    initialize: function(uid) {
        this.url = `http://hushhush.firebaseio.com/users/${uid}/messages`
    }
})

// inside component
var DashPage = React.createClass({
    
    componentWillMount: function() {
        var self = this
        this.props.msgColl.on('sync',function() {
            self.forceUpdate()
        })
    },

    render: function() {
        return (
            <div className="dashboard">
                <a href="#logout" >log out</a>
                <Messenger />
                <Inbox msgColl={this.props.msgColl} />
            </div>
            )
    }
})

var Inbox = React.createClass({

    _makeMessage: function(mod,i) {
        return <Message msgData={mod} key={i} />
    },

    render: function() {
        return (
            <div className="inbox">
                {this.props.msgColl.map(this._makeMessage)}
            </div>
            )
    }
})

var Message = React.createClass({

    render: function() {
        var containerStyle = {display: 'block'}
        var imgStyle = {display: 'block'}
        if (!this.props.msgData.get('image_data')) imgStyle.display = "none"
        if (this.props.msgData.id === undefined) containerStyle.display = "none"
        
        return (
            <div style={containerStyle} className="message" >
                <p className="author">from {this.props.msgData.get('sender_email')}</p>
                <p className="content">{this.props.msgData.get('content')}</p>
                <img style={imgStyle} src={this.props.msgData.get('image_data')} />
            </div>
            )
    }
})

var Messenger = React.createClass({

    imageFile: null,
    targetEmail: '',
    msg: '',

    _handleUpload: function(e) {
        var inputEl = e.target
        this.imageFile = inputEl.files[0]        
    },

    _setTargetEmail: function(e) {
        this.targetEmail = e.target.value
    },

    _setMsg: function(e) {
        this.msg = e.target.value
    },

    _submitMessage: function() {
        var queriedUsers = new QueryByEmail(this.targetEmail)
        var self = this,
            msgObject = {
                        content: self.msg,
                        sender_email: ref.getAuth().password.email,
                        sender_id: ref.getAuth().uid,
                        image_data: null
                    }

        var sendMessage = function() {
            console.log('sending msg')
            var usrId = queriedUsers.models[0].get('id')
            var usrMsgCollection = new UserMessages(usrId)
            usrMsgCollection.create(msgObject)
        }

        var promise = queriedUsers.fetchWithPromise()
    
        if (this.imageFile) {
            var reader = new FileReader()
            reader.readAsDataURL(this.imageFile)
            reader.addEventListener('load', function() {
                var base64string = reader.result
                msgObject.image_data = base64string
                promise.then(sendMessage)
            })
        }

        else {
            promise.then(sendMessage)
        }
    },

    render: function() {
        return (
            <div className="messager" >
                <input placeholder="recipient email" onChange={this._setTargetEmail} />
                <textarea placeholder="your message here" onChange={this._setMsg} />
                <input type="file" onChange={this._handleUpload} />
                <button onClick={this._submitMessage} >submit!</button>
            </div>
            )
    }
})

var SplashPage = React.createClass({
    email: '',
    password: '',
    realName: '',

    _handleSignUp: function() {
        this.props.createUser(this.email,this.password,this.realName)
    },

    _handleLogIn: function() {
        this.props.logUserIn(this.email,this.password)
    },

    _updateEmail: function(event) {
        this.email = event.target.value
    },

    _updateName: function(event) {
        this.realName = event.target.value
    },

    _updatePassword: function(event) {
        this.password = event.target.value
    },

    render: function() {
        return (
            <div className="loginContainer">
                <input onChange={this._updateEmail} />
                <input onChange={this._updatePassword} type="password" />
                <input placeholder="enter your real name" onChange={this._updateName} />
                <div className="splashButtons" >
                    <button onClick={this._handleSignUp} >sign up</button>
                    <button onClick={this._handleLogIn} >log in</button>
                </div>
            </div>
            )
    }
})

console.log('hi')
function app() {
    // start app
    // new Router()
    var PsstRouter = Backbone.Router.extend({
        routes: {
            'splash': "showSplashPage",
            'dash': "showDashboard",
            'logout': "doLogOut",
            "*anything": 'showSplashPage'
        },

        initialize: function() {
            this.ref = new Firebase('https://hushhush.firebaseio.com/')
            window.ref = this.ref

            if (!this.ref.getAuth()) {
                location.hash = "splash"
            }

            this.on('route', function() {
                if (!this.ref.getAuth()) {
                    location.hash = "splash"
                }
            })
        },

        doLogOut: function() {
            this.ref.unauth()
            location.hash = "splash"
        },

        showSplashPage: function() {
            console.log('splish splash!')
            DOM.render(<SplashPage logUserIn={this._logUserIn.bind(this)} createUser={this._createUser.bind(this)} />, document.querySelector('.container'))
        },

        showDashboard: function() {
            var uid = ref.getAuth().uid
            var msgColl = new UserMessages(uid)
            DOM.render(<DashPage msgColl={msgColl} />,document.querySelector('.container'))
        },

        _logUserIn: function(email,password){
            console.log(email,password)
            this.ref.authWithPassword({
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
            this.ref.createUser({
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
