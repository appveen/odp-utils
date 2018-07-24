let e = {};

const req = require("./requestHandler");

const _baseURL = "/apis/apps/v1";
var fs = require('fs');

function base64_encode(file) {
    var bitmap = fs.readFileSync(file);
    return new Buffer(bitmap).toString('base64');
}

e.createSecret = (ns) => {
    console.log("Creating a new secret :: in ", ns);
    let file = process.env.DOCKER_CONFIG;
    logger.info("++++++++++"+file);
    let base64En = base64_encode(file);
    logger.info(base64En);
    var data = {
        "kind": "Secret",
        "apiVersion": "v1",
        "metadata": {
            "name": "regsecret",
            "namespace": ns
        },
        "data": {
            ".dockerconfigjson": base64En
        },
        "type": "kubernetes.io/dockerconfigjson"
    };
    logger.info(JSON.stringify(data));
    return req.post(_baseURL + "/namespaces/" + ns + "/secrets", data)
        .then(_d => {
            return data;
        }, _e => {
            return _e;
        });
}


module.exports = e;