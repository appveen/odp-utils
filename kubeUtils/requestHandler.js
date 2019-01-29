"use strict"

var e = {};

const req = require('request-promise');
const fs = require("fs");

const URL = "https://kubernetes.default.svc";

var odp_token = "";
odp_token = fs.readFileSync("/var/run/secrets/kubernetes.io/serviceaccount/token");

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
			"Authorization": "Bearer " + odp_token,
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

e.put = (_api, _body) => {
	var options = {
		method: "PUT",
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