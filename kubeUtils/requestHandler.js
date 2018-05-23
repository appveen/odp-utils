"use strict"

var e = {};

const req = require('request-promise');
const fs = require("fs");

const HOST = process.env.KUBERNETES_SERVICE_HOST;
const PORT = process.env.KUBERNETES_SERVICE_PORT;
const URL = "https://" + HOST + ":" + PORT;

const KEY = process.env.MDM_KEY;
const CRT = process.env.MDM_CRT;

var mdm_key = "";
if(KEY) mdm_key = fs.readFileSync(KEY);
var mdm_crt = "";
if(CRT) mdm_crt = fs.readFileSync(CRT);

e.get = (_api) => {
	var options = {
		method: "GET",
		uri: URL + _api,
		strictSSL: false,
		json: true,
		agentOptions: {
			cert: mdm_crt,
	        key: mdm_key
	    }
	}
	return req(options)
}

e.post = (_api, _body) => {
	var options = {
		method: "POST",
		uri: URL + _api,
		strictSSL: false,
		agentOptions: {
			cert: mdm_crt,
	        key: mdm_key
	    },
	    json: true,
	    body: _body
	}
	return req(options)
}

e.patch = (_api, _body) => {
	var options = {
		method: "PATCH",
		uri: URL + _api,
		strictSSL: false,
		agentOptions: {
			cert: mdm_crt,
	        key: mdm_key
	    },
	    headers: {
	    	"Content-Type": "application/merge-patch+json"
	    },
	    json: true,
	    body: _body
	}
	return req(options)
}

e.delete = (_api, _body) => {
	var options = {
		method: "DELETE",
		uri: URL + _api,
		strictSSL: false,
		agentOptions: {
			cert: mdm_crt,
	        key: mdm_key
	    },
	    json: true,
	    body: _body
	}
	return req(options)
}

module.exports = e;