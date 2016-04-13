import React, {Component} from 'react'
import Backbone from 'bbfire'
import Actions from './actions'
import {Models,Collections} from './models'

var AddCliq = React.createClass({
    _save: function() {
        Actions.saveCliq({
            name: this.name,
            summary: this.summary
        })
    },

    _updateName: function(e) {
        this.name = e.target.value
    },

    _updateSummary: function(e) {
        this.summary = e.target.value
    },

    render: function() {
        return (
            <div className="addCliq">
                <input onChange={this._updateName} placeholder="cliq name" />
                <input onChange={this._updateSummary} placeholder="cliq summary" />
                <button onClick={this._save}>save</button>
            </div>
            )
    }
})

var CliqView = React.createClass({

    componentWillMount: function() {
        var self = this
        this.props.peepsColl.on('sync update',function() {
            self.forceUpdate()
        })
        this.props.secretsColl.on('sync update', function(){
            self.forceUpdate()
        })
    },

    render: function() {
        return (
            <div className="cliqView" >
                <NavBar />
                <h3>my cliq</h3>
                <PeepsList cliqId={this.props.cliqId} peepsColl={this.props.peepsColl} />
                <Secrets cliqId={this.props.cliqId} secretsColl={this.props.secretsColl} />
            </div>
            )
    }
})

var DashPage = React.createClass({
    
    componentWillMount: function() {
        var self = this
    },

    render: function() {
        var content = <div></div>
        if (this.props.view === "add") {
            content = <AddCliq />
        }

        return (
            <div className="dashboard">
                <NavBar />
                {content}
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

var PeepsList = React.createClass({

    _addPeep: function(keyEvent){
        if (keyEvent.keyCode === 13) {
            var email = keyEvent.target.value
            var qbe = new Collections.QueryByEmail(email)
            var component = this
            qbe.fetchWithPromise().then(function() {
                var userToAdd = qbe.models[0]
                if (userToAdd.id) {
                    Actions.addPeep(component.props.cliqId,userToAdd)
                    component.props.peepsColl.add(userToAdd)
                }
                else alert("no user with that email!")
            })
            
        }
        
    },

    _genPeep: function(peepModel,i) {
        return <Peep remover={this._remover} model={peepModel} key={i} />
    },

    _remover: function(model) {
        this.props.peepsColl.remove(model)
    },

    render: function() {
        return (
            <div className="peeps">
                <h4>all my peeps</h4>
                {this.props.peepsColl.map(this._genPeep)}
                <input placeholder="add a nice peep" onKeyDown={this._addPeep} />
            </div>
            )
    }
})

var Peep = React.createClass({

    _ostracize: function() {
        // unset the peep's cliq_id
        this.props.model.set({cliq_id: ''})

        // remove the peep from the peepsColl
        this.props.remover(this.props.model)
    },

    render: function() {
        var styleObj = {display: "block"}
        if (!this.props.model.id) styleObj.display = "none"

        return (
            <div style={styleObj} className="peep">
                <p>{this.props.model.get('name')}</p><button onClick={this._ostracize}>X</button>
            </div>
                )
    }
})

var NavBar = React.createClass({
    render: function() {
        return (
            <div className="navBar">
                <a href="#mycliq">my cliq</a>
                <a href="#addcliq">add a cliq</a>
                <a href="#logout">log out</a>
                <a href="#dash">dashboard</a>
            </div>
            )
    }
})

var Secrets = React.createClass({

    _postSecret: function(keyEvent) {
        if (keyEvent.keyCode === 13) {
            var secretText = keyEvent.target.value
            keyEvent.target.value = ''
            var secretObj = {
                text: secretText,
                cliq_id: this.props.cliqId
            }
            Actions.addSecret(secretObj)

        }
    },

    _handleSecrets: function(){
        var secretsArr = this.props.secretsColl.map(function(secret, i){
            console.log(secret)
            return(
                <p key={i}> {secret.get("text")} </p>
                )
        })
        return secretsArr
    },

    render: function() {
       
        return (
            <div className="secrets">
                <textarea 
                    placeholder="post a new secret" 
                    onKeyDown={this._postSecret} 
                />
                <div>
                    {this._handleSecrets()}
                </div>
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

export {SplashPage,DashPage,CliqView}