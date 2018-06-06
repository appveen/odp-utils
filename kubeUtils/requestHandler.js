"use strict"

var e = {};

const req = require('request-promise');
const fs = require("fs");

const HOST = process.env.KUBERNETES_SERVICE_HOST;
const PORT = process.env.KUBERNETES_SERVICE_PORT;
const URL = "https://" + HOST + ":" + PORT;

const TOKEN = process.env.ODP_TOKEN;

var odp_token = "";
if(TOKEN) odp_token = fs.readFileSync(TOKEN);

e.get = (_api) => {
	var options = {
		method: "GET",
		uri: URL + _api,
		strictSSL: false,
		json: true,
		headers:{
			"Authorization": "Bearer " + odp_token
		}
	}
	return req(options)
}

e.post = (_api, _body) => {
	var options = {
		method: "POST",
		uri: URL + _api,
		strictSSL: false,
		headers:{
			"Authorization": "Bearer " + odp_token
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
		headers:{
			"Authorization": "Bearer " + odp_token
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
		headers:{
			"Authorization": "Bearer " + odp_token
		},
	    json: true,
	    body: _body
	}
	return req(options)
}

module.exports = e;