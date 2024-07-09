var mongoose = require('mongoose');

var OrgSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    coin_address: { 
        type: String,
        unique: true
    },
    balances: {                 // Mixed: { {coin_address: balance}, {coin_address2: balance2} },
        type: {},
    },
    assets:  {                 // Mixed: [ asset_address: owner, asset_address2: owner, ...],
        type: {},
        // default: []          // Arrays implicitly have a default value of [] (empty array).
    },
    // users, companies
    permits: {
        type: {
            orgs: {         // really ???
                type: {}
            },
            companies: { 
                type: {}
            },
            users: { 
                type: {}
            }
        },
        default: {}
    },
    chain: {
        type: {
            address: {
                type: String,
                //required: true,
                unique: true
            },
            public: { 
                type: String,
                required: true
            },
            private: {
                type: String
            }
        },
        default: {}
    },
    info: {
        type: {},
    },
});

OrgSchema.method('lcltAddPermit', async function(type, address, role) {
    this['permits'] = this['permits'] ?? {};
        
    if (this['permits'][type] == null) {
        this['permits'][type] = {};
    }
    this['permits'][type][address] = role;
    this.markModified('permits');
    await this.save();

    return this;
});

OrgSchema.method('lcltAddBalance', async function (coin_address, count) {
    this.balances = this.balances ?? {};
    if (this.balances[coin_address] == null) {
        this.balances[coin_address] = 0;
    }
    this.balances[coin_address] = this.balances[coin_address] + count;
    this.markModified('balances');
    await this.save();

    return this;
});

OrgSchema.method('lcltSubBalance', async function (coin_address, count) {
    this.balances = this.balances ?? {};
    if (this.balances[coin_address] == null) {
        this.balances[coin_address] = 0;
    }
    this.balances[coin_address] = this.balances[coin_address] - count;
    this.markModified('balances');
    await this.save();

    return this;
});


var Org = new mongoose.model('Orgs', OrgSchema);

module.exports = {
    Org,
}
  