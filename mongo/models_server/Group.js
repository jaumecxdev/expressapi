const mongoose = require('mongoose');
// https://mongoosejs.com/docs/schematypes.html

const GroupSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true,
        unique: true
    },
    public: { 
        type: String,
        required: true
    },
    private: {
        type: String,
        required: true
    },
    // ALL permissions: '', owner, admin, payer, cashier
    // ORGS: companies('') + users(permissions), PERHAPS OTHER ORGS???
	// COMPANIES: orgs('') + users(permissions)
	// USERS: orgs(permissions) + companies(permissions)
    orgs: {},
    companies: {},
    users: {},
});

const Group = new mongoose.model('Group', GroupSchema);

module.exports = {
    Group
}
  