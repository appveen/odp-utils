let e = {};
const _ = require('lodash')
const mongoose = require("mongoose");

function isValue(a) {
    return a == null || !(typeof a == 'object');
}

function isArray(a) {
    return Array.isArray(a);
}

function isEqual(a, b) {
    return (_.isEqual(a, b));
}

function getDiff(a, b, oldData, newData) {
    if (a === null || b === null) {
        Object.assign(oldData, a);
        Object.assign(newData, b);
    }
    else if (typeof a == "object" && typeof b == "object") {
        Object.keys(a).forEach(_ka => {
            if (typeof b[_ka] == 'undefined') {
                oldData[_ka] = a[_ka];
                newData[_ka] = null;
            } else if (isValue(a[_ka]) || isArray(a[_ka])) {
                if (!isEqual(a[_ka], b[_ka])) {
                    oldData[_ka] = a[_ka];
                    newData[_ka] = b[_ka];
                }
                delete b[_ka];
            } else {
                oldData[_ka] = {};
                newData[_ka] = {};
                getDiff(a[_ka], b[_ka], oldData[_ka], newData[_ka]);
                if (_.isEmpty(oldData[_ka])) delete oldData[_ka];
                if (_.isEmpty(newData[_ka])) delete newData[_ka];
                delete b[_ka];
            }
        });
        Object.keys(b).forEach(_kb => {
            oldData[_kb] = null;
            newData[_kb] = b[_kb];
        });
    }
}

e.getAuditPreSaveHook = (collectionName)=> {
    return function(next, req){
        let data = {};
        data.user = req.user ? req.user.username : null;
        data.txnId = req.get('TxnId');
        data.timeStamp = new Date();
        data.data = {};
        if(this._id){
            mongoose.connection.db.collection(collectionName).findOne({_id: this._id})
            .then(doc => {
                data.data.old = doc ? doc : null;
                this._auditData = data;
                next();
            });
        }else{
            this._auditData = data;
            next();
        }
    };
};

e.getAuditPostSaveHook = (collectionName)=>{
    return function(doc){
        let oldData = doc._auditData.data.old;
        let newData = doc.toJSON();
        delete doc._auditData.data;
        let auditData = doc._auditData;
        auditData.deleted = false;
        auditData.data = {};
        auditData.data._id = doc._id;
        auditData.data.new = {};
        auditData.data.old = {};
        getDiff(oldData, newData, auditData.data.old, auditData.data.new);
        mongoose.connection.db.collection(collectionName).insert(auditData); 
    };
};

e.getAuditPreRemoveHook = ()=>{
    return function(next, req){
        let data = {};
        data.user = req.user ? req.user.username : null;
        data.txnId = req.get('TxnId');
        data.timeStamp = new Date();
        data.data = {};
        data.data.new = null;
        data.data.old = this.toJSON();
        data.data._id = this._id;
        this._auditData = data;
        next();
    };
}

e.getAuditPostRemoveHook = (collectionName)=>{
    return function(doc){
        mongoose.connection.db.collection(collectionName).insert(doc._auditData); 
    };
};

module.exports = e;