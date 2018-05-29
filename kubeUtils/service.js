"use strict"

const req = require("./requestHandler");

const _baseURL = "/api/v1";

var e = {};

e.getAllServices = () => {
	return req.get(_baseURL + "/services")
	.then(_d => {
		var data = _d;
		var res = []
		data.items.forEach(_i => res.push({
			name: _i.metadata.name,
			namespace: _i.metadata.namespace,
			type: _i.spec.type
		}));
		return res;
	}, _e => {
		return _e;
	});
}

e.getAllServicesForNamespace = (_namespace) => {
	return req.get(_baseURL + "/namespaces/" + _namespace + "/services")
	.then(_d => {
		var data = _d;
		var res = []
		data.items.forEach(_i => res.push({
			name: _i.metadata.name,
			namespace: _i.metadata.namespace,
			type: _i.spec.type
		}));
		return res;
	}, _e => {
		return _e;
	});
}

e.getService = (_namespace, _name) => {
	return req.get(_baseURL + "/namespaces/" + _namespace + "/services/" + _name)
	.then(_d => {
		return _d;
	}, _e => {
		return _e;
	});
}

e.createService = (_namespace, _name, _port) => {
	console.log("Creating a new service :: ", _namespace, _name, _port);
	var data = {
		"metadata": {
			"name": _name,
			"namespace": _namespace
		},
		"spec": {
			"type": "ClusterIP",
			"selector": {
			 	"app": _name
			},
			"ports": [
				{
					"protocol": "TCP",
					"port": 80,
					"targetPort": _port
				}
			]
		}
	};
	return req.post(_baseURL + "/namespaces/" + _namespace + "/services", data)
	.then(_d => {
		return data;
	}, _e => {
		return _e;
	});
}

e.updateService = (_namespace, _name, _port) => {
	console.log("Updating the service :: ", _namespace, _name, _port);
	var data = {
  		"spec": {
    	"ports": [
      		{
		    	"protocol": "TCP",
		        "port": 80,
		        "targetPort": _port
      		}
    	]
		}
	};
	return req.patch(_baseURL + "/namespaces/" + _namespace + "/services/" + _name, data)
	.then(_d => {
		return data;
	}, _e => {
		return _e;
	});
}

e.deleteService = (_namespace, _name) => {
	console.log("Deleting service ::", _namespace, _name);
	var data = {};
	return req.delete(_baseURL + "/namespaces/" + _namespace + "/services/" + _name, data)
	.then(_d => {
		return data;
	}, _e => {
		return _e;
	});
}

module.exports = e;