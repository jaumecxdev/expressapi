var { mongoose } = require('mongoose');

var AccountSchema = new mongoose.Schema({
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
        type: String
    },
    type: {
        type: String,   
        default: 'users'        // users, companies, orgs
    },

    balances: {                 // Mixed: { {coin_address: balance}, {coin_address2: balance2} },
        type: {},
    },
    assets:  {                 // Mixed: [ asset_address: owner, asset_address2: owner, ...],
        type: {},
        // default: []          // Arrays implicitly have a default value of [] (empty array).
    },
    permits: { 
        type: {
            orgs: {             // companies & users
                type: {}
            },
            companies: {        // orgs & users
                type: {}
            },
            users: {            // companies & orgs
                type: {}
            }
        },
        default: {}
    },
    // { shippings: [], billings: []}
    addresses: {
        type: {},
    },

    // web, twitter, facebook, instagram, tiktok, ...
    // email, password, firstname, lastName, phone, coin_address, ...
    // role: API_ROLE: super_admin (tech admin), admin (manager admin), user (user)
    info: {
        type: {},
    }
});


// Set Coin to Org
AccountSchema.method('lcltSetCoinAddress', async function (coin_address) {
    this.info['coin_address'] = coin_address;
    this.markModified('info');
    await this.save();

    return this;
});


AccountSchema.method('lcltAddPermit', async function(type, address, role) {
    this['permits'] = this['permits'] ?? {};
        
    if (this['permits'][type] == null) {
        this['permits'][type] = {};
    }
    this['permits'][type][address] = role;
    this.markModified('permits');
    await this.save();

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

AccountSchema.method('lcltAddBalance', async function (coin_address, count) {
    this.balances = this.balances ?? {};
    if (this.balances[coin_address] == null) {
        this.balances[coin_address] = 0;
    }
    this.balances[coin_address] = this.balances[coin_address] + count;
    this.markModified('balances');
    await this.save();

    return this;
});

AccountSchema.method('lcltSubBalance', async function (coin_address, count) {
    this.balances = this.balances ?? {};
    if (this.balances[coin_address] == null) {
        this.balances[coin_address] = 0;
    }
    this.balances[coin_address] = this.balances[coin_address] - count;
    this.markModified('balances');
    await this.save();

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


var Account = new mongoose.model('Account', AccountSchema);

module.exports = {
    Account
}
  