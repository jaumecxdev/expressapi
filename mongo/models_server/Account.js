const mongoose = require('mongoose');
// https://mongoosejs.com/docs/schematypes.html

const AccountSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true,
        unique: true
    },
    publicKey: { 
        type: String,
        required: true
    },
    privateKey: {
        type: String,
        required: true
    },
    type: {
        type: String,
        default: 'users'         // orgs, companies, users
    },
    name: {
        type: String
    },

    coin_address: {             // ONLY for Org accounts
        type: String
    },

    // to.markModified('balances');
    balances: {                 // Mixed: { {coin_address: balance}, {coin_address2: balance2} },
        type: {},
    },

    // to.markModified('assets');
    assets:  {                 // Mixed: [ asset_address: owner, asset_address2: owner, ...],
        type: {},
        // default: []          // Arrays implicitly have a default value of [] (empty array).
    },

    // orgs: {}, companies: {}, users: {}
    // '', owner, admin, payer, cashier
    // ORGS: companies('') + users(permissions), PERHAPS OTHER ORGS???
	// COMPANIES: orgs('') + users(permissions)
	// USERS: orgs(permissions) + companies(permissions)
    // to.markModified('permits');
    permits: { 
        type: {},       
    },

    // to.markModified('info');
    info:  {            // policies, configs, preferences, ...
        type: {},
    },
});

AccountSchema.method('lcltAddPermit', function (type, address, role) {
    this.permits = this.permits ?? {};
        
    if (this.permits[type] == null) {
        this.permits[type] = {};
    }
    this.permits[type][address] = role;
    this.markModified('permits');
    this.save();

    return this;
});

AccountSchema.method('lcltHasPermitRoles', function (type, address, roles) {
    if (this.permits != null &&  
        this.permits[type] != null && 
        this.permits[type][address] != null &&
        roles.includes(this.permits[type][address])) {

        return true;
    }

    return false;
});

AccountSchema.method('lcltAddBalance', function (coin_address, count) {
    this.balances = this.balances ?? {};
    if (this.balances[coin_address] == null) {
        this.balances[coin_address] = 0;
    }
    this.balances[coin_address] = this.balances[coin_address] + count;
    this.markModified('balances');
    this.save();

    return this;
});

AccountSchema.method('lcltSubBalance', function (coin_address, count) {
    this.balances = this.balances ?? {};
    if (this.balances[coin_address] == null) {
        this.balances[coin_address] = 0;
    }
    this.balances[coin_address] = this.balances[coin_address] - count;
    this.markModified('balances');
    this.save();

    return this;
});

AccountSchema.method('lcltHasBalance', function (coin_address, count) {
    if (this.balances != null && 
        this.balances[coin_address] != null && 
        this.balances[coin_address] >= count) {

        return true;
    }

    return false;
});

const Account = new mongoose.model('Account', AccountSchema);

module.exports = {
    Account, AccountSchema
}
  