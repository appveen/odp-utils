let e = {};

e.auditTrail = require('./auditTrail');
e.kubeutil = require("./kubeUtils/app");
e.logToMongo = require("./logToMongo");
module.exports = e;
