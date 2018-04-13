"use strict";

let e = {};

e.namespace = require("./namespace")
e.deployment = require("./deployment")
e.service = require("./service")
e.docker = require("./docker");

module.exports = e;