"use strict"

const req = require("./requestHandler");

const _baseURL = "/api/v1/namespaces";

var e = {};

e.getAllNamespaces = () => {
	return req.get(_baseURL)
	.then(_d => {
		var data = _d;
		var res = []
		data.items.forEach(_i => res.push({
			name: _i.metadata.name,
			status: _i.status.phase
		}));
		return res;
	}, _e => {
		return _e;
	});
}

e.getNamespace = (_name) => {
	return req.get(_baseURL + "/" + _name)
	.then(_d => {
		return _d
	}, _e => {
		return _e;
	});
}

e.createNamespace = (_name) => {
	var data = {"metadata": {"name": _name}};
	return req.post(_baseURL, data)
	.then(_d => {
		return data;
	}, _e => {
		return _e;
	});
}

e.deleteNamespace = (_name) => {
	var data = {};
	return req.delete(_baseURL + "/" + _name, data)
	.then(_d => {
		return data;
	}, _e => {
		return _e;
	});
}

module.exports = e;