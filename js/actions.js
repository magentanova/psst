import Backbone from 'bbfire'
import ref from './fbRef'
import {Models,Collections} from './models'


var Actions = {
	saveCliq: function(cliqData) {
		var cc = new Collections.CliqCollection()
		var newCliqModel = cc.create(cliqData),
			cliqId = newCliqModel.id
		var me = new Models.UserModel(ref.getAuth().uid)
		me.set({cliq_id: cliqId})
		// newCliqModel.set({
		// 	creator_id: ref.getAuth().uid,
		// 	creator_name: me.get('name')
		// })
	},

	addPeep: function(cliqId,userModel) {
		// we need a peep email to locate the user
		// and a cliq_id to assign them the new id
		userModel.set({cliq_id:cliqId})
		userModel.save()
	},

	addSecret: function(secretObject) {
		var secretsColl = new Collections.SecretsCollection()
		secretsColl.create(secretObject)
	}
}

export default Actions