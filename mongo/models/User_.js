var { mongoose } = require('mongoose');

var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: { 
        type: String,
        required: true
    },
    firstName: {
        type: String,
        default: ''
    },
    lastName: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        default: ''
    },
    // { shippings: [], billings: []}
    addresses: {
        type: {},
    },

    // API ROLE
    role: {
        type: String,
        default: 'user'         // super_admin (tech admin), admin (manager admin), user (user)
    },
    balances: {                 // Mixed: { {coin_address: balance}, {coin_address2: balance2} },
        type: {},
    },
    assets:  {                 // Mixed: [ asset_address: owner, asset_address2: owner, ...],
        type: {},
        // default: []          // Arrays implicitly have a default value of [] (empty array).
    },
    // API PERMITS ???
    permits: { 
        type: {
            orgs: {
                type: {}
            },
            companies: { 
                type: {}
            }
        },
        default: {}
    },
    // address, public, private:
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

    // web, twitter, facebook, instagram, tiktok, ...
    info: {
        type: {},
    },

    
    // balances: {}
    // assets: {}
});


/* UserSchema.method('lcltGenerateTokens', async () => {
    return await generateTokens(this._id, this.email);
}); */

UserSchema.method('lcltSetChain', async function (address, publicKey, privateKey) {
    this.chain = {
        address: address,
        public: publicKey,
        private: privateKey
    }

    this.markModified('chain');
    await this.save();

    return this;
});

UserSchema.method('lcltAddPermit', async function(type, address, role) {
    this['permits'] = this['permits'] ?? {};
        
    if (this['permits'][type] == null) {
        this['permits'][type] = {};
    }
    this['permits'][type][address] = role;
    this.markModified('permits');
    await this.save();

    return this;
});

UserSchema.method('lcltHasPermitRoles', function (type, address, roles) {
    if (this.permits != null &&  
        this.permits[type] != null && 
        this.permits[type][address] != null &&
        roles.includes(this.permits[type][address])) {

        return true;
    }

    return false;
});

UserSchema.method('lcltAddBalance', async function (coin_address, count) {
    this.balances = this.balances ?? {};
    if (this.balances[coin_address] == null) {
        this.balances[coin_address] = 0;
    }
    this.balances[coin_address] = this.balances[coin_address] + count;
    this.markModified('balances');
    await this.save();

    return this;
});

UserSchema.method('lcltSubBalance', async function (coin_address, count) {
    this.balances = this.balances ?? {};
    if (this.balances[coin_address] == null) {
        this.balances[coin_address] = 0;
    }
    this.balances[coin_address] = this.balances[coin_address] - count;
    this.markModified('balances');
    await this.save();

    return this;
});

UserSchema.method('lcltHasBalance', function (coin_address, count) {
    if (this.balances != null && 
        this.balances[coin_address] != null && 
        this.balances[coin_address] >= count) {

        return true;
    }

    return false;
});


var User = new mongoose.model('User', UserSchema);

module.exports = {
    User
}
  