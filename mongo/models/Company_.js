var mongoose = require('mongoose');

var CompanySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        //unique: true
    },
    // users, orgs
    permits: { 
        type: {
            orgs: {
                type: {}
            },
            companies: {    // really ???
                type: {}
            },
            users: { 
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

});

CompanySchema.method('lcltAddPermit', async function(type, address, role) {
    this['permits'] = this['permits'] ?? {};
        
    if (this['permits'][type] == null) {
        this['permits'][type] = {};
    }
    this['permits'][type][address] = role;
    this.markModified('permits');
    await this.save();

    return this;
});

var Company = new mongoose.model('Company', CompanySchema);

module.exports = {
    Company,
}
  