const mongoose = require('mongoose');
// https://mongoosejs.com/docs/schematypes.html

const PermitSchema = new mongoose.Schema({
    
    // ALL permissions: '', owner, admin, payer, cashier
    // ORGS: companies('') + users(permissions), PERHAPS OTHER ORGS???
	// COMPANIES: orgs('') + users(permissions)
	// USERS: orgs(permissions) + companies(permissions)
    orgs: { type: {} },
    companies: { type: {} },
    users: { type: {} }
});

const Permit = new mongoose.model('Permit', PermitSchema);

module.exports = {
    Permit, PermitSchema
}
  