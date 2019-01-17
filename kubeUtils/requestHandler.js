"use strict"

var e = {};

const req = require('request');
const fs = require("fs");

const HOST = process.env.KUBERNETES_SERVICE_HOST;
const PORT = process.env.KUBERNETES_SERVICE_PORT;
const URL = "https://" + HOST + ":" + PORT;

const TOKEN = process.env.ODP_TOKEN;

var odp_token = "";
if (TOKEN) odp_token = fs.readFileSync(TOKEN);

e.get = (_api) => {
	var options = {
		method: "GET",
		url: URL + _api,
		json: true,
		headers: {
			'Content-Type': 'application/json',
			"Authorization": "Bearer " + odp_token
		},
	}
	return new Promise((resolve, reject) => {
		req(options, function (err, res, body) {
			if (err) {
				return reject(err);
			}
			else {
				return resolve({ statusCode: res.statusCode, body: body });
			}
		})
	})
}

e.post = (_api, _body) => {
	var options = {
		method: "POST",
		url: URL + _api,
		headers: {
			'Content-Type': 'application/json',
			"Authorization": "Bearer " + odp_token
		},
		json: true,
		body: _body,
	}
	return new Promise((resolve, reject) => {
		req(options, function (err, res, body) {
			if (err) {
				return reject(err);
			}
			else {
				return resolve({ statusCode: res.statusCode, body: body });
			}
		})
	})
}

e.patch = (_api, _body) => {
	var options = {
		method: "PATCH",
		url: URL + _api,
		headers: {
			"Authorization": "Bearer " + odp_token,
			"Content-Type": "application/merge-patch+json"
		},
		json: true,
		body: _body
	}
	return new Promise((resolve, reject) => {
		req(options, function (err, res, body) {
			if (err) {
				return reject(err);
			}
			else {
				return resolve({ statusCode: res.statusCode, body: body });
			}
		})
	})
}

e.delete = (_api, _body) => {
	var options = {
		method: "DELETE",
		url: URL + _api,
		headers: {
			'Content-Type': 'application/json',
			"Authorization": "Bearer " + odp_token
		},
		json: true,
		body: _body
	}
	return new Promise((resolve, reject) => {
		req(options, function (err, res, body) {
			if (err) {
				return reject(err);
			}
			else {
				return resolve({ statusCode: res.statusCode, body: body });
			}
		})
	})
}

e.put = (_api, _body) => {
	var options = {
		method: "PUT",
		url: URL + _api,
		headers: {
			'Content-Type': 'application/json',
			"Authorization": "Bearer " + odp_token
		},
		json: true,
		body: _body
	}
	return new Promise((resolve, reject) => {
		req(options, function (err, res, body) {
			if (err) {
				return reject(err);
			}
			else {
				return resolve({ statusCode: res.statusCode, body: body });
			}
		})
	})
}

module.exports = e;