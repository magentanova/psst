import Backbone from 'bbfire'
import Firebase from 'firebase'
import ref from './fbRef'


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

var Models = {
    UserModel: Backbone.Firebase.Model.extend({
        initialize: function(uid) {
            this.url = `http://hushhush.firebaseio.com/users/${uid}`
        }
    })
}

var Collections = {
    QueryByEmail: Backbone.Firebase.Collection.extend({
        initialize: function(targetEmail) {
            this.url = ref.child('users').orderByChild('email').equalTo(targetEmail)
        },
        autoSync: false
    }),

    UsersByCliqId: Backbone.Firebase.Collection.extend({
        initialize: function(targetCliqId) {
            this.url = ref.child('users').orderByChild('cliq_id').equalTo(targetCliqId)
        }
    }),

    CliqCollection: Backbone.Firebase.Collection.extend({
        url: 'http://hushhush.firebaseio.com/cliqs'
    })
}

export {Models,Collections}