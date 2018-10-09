let e = {};

e.auditTrail = require('./auditTrail');
e.kubeutil = require("./kubeUtils/app");
e.logToMongo = require("./logToMongo");
e.logToQueue = require("./logToQueue");
module.exports = e;
