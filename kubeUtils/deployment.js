"use strict"

const req = require("./requestHandler");

const _baseURL = "/apis/apps/v1";

const logger = global.logger;

var e = {};

e.getAllDeployments = () => {
	return req.get(_baseURL + "/deployments")
	.then(_d => {
		var data = _d;
		var res = []
		data.items.forEach(_i => res.push({
			name: _i.metadata.name,
			namespace: _i.metadata.namespace,
			status: _i.status.conditions[0].type
		}));
		return res;
	}, _e => {
		return _e;
	});
}

e.getAllDeploymentsForNamespace = (_namespace) => {
	return req.get(_baseURL + "/namespaces/" + _namespace + "/deployments")
	.then(_d => {
		var data = _d;
		var res = []
		data.items.forEach(_i => res.push({
			name: _i.metadata.name,
			namespace: _i.metadata.namespace,
			status: _i.status.conditions[0].type
		}));
		return res;
	}, _e => {
		return _e;
	});
}

e.getDeployment = (_namespace, _name) => {
	return req.get(_baseURL + "/namespaces/" + _namespace + "/deployments/" + _name)
	.then(_d => {
		return _d;
	}, _e => {
		return _e;
	});
}

e.createDeployment = (_namespace, _name, _image, _port, _envVars) => {
	logger.debug("Creating a new deployment :: ", _namespace, _name, _image, _port, _envVars);
	var data = {
		"metadata": {
			"name": _name,
			"namespace": _namespace
		},
		"spec": {
			"replicas": 1,
			"selector": {
		    	"matchLabels": {
		    		"app": _name
		    	}
		    },
			"template": {
				"metadata": {
					"labels": {
						"app": _name
					}
				},
				"spec": {
					"containers": [
						{
							"name": _name,
							"image": _image,
							"ports": [
								{
									"containerPort": _port
								}
							],
							"env": _envVars
						}
					]
				}
			}
		}
	};
	return req.post(_baseURL + "/namespaces/" + _namespace + "/deployments", data)
	.then(_d => {
		return data;
	}, _e => {
		return _e;
	});
}

e.updateDeployment = (_namespace, _name, _image) => {
	logger.debug("Updating the deployment :: ", _namespace, _name, _image);
	var data = {
  		"spec": {
		    "template": {
		      "spec": {
		        "containers": [
		          {
		            "image": _image,
		            "name": _name
		          }
		        ]
		      }
		    }
	  	}
	};
	return req.patch(_baseURL + "/namespaces/" + _namespace + "/deployments/" + _name, data)
	.then(_d => {
		return data;
	}, _e => {
		return _e;
	});
}

e.deleteDeployment = (_namespace, _name) => {
	logger.debug("Deleting the deployment :: ", _namespace, _name);
	var data = {};
	return req.delete(_baseURL + "/namespaces/" + _namespace + "/deployments/" + _name, data)
	.then(_d => {
		return data;
	}, _e => {
		return _e;
	});
}

module.exports = e;