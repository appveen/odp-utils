const pathNotToLog = ["/audit", "/audit/count", "/webHookStatus", "/webHookStatus/count", "/logs", "/logs/count", "/health"];
function logToQueue(name, client, queueName, collectionName) {
    return function (req, res, next) {
        let start = new Date();
        res.on('finish', function () {
            let end = new Date();
            let diff = end - start;
            let headers = JSON.parse(JSON.stringify(req.headers));
            headers.authorization = "JWT *************************";
            if (pathNotToLog.some(_k => req.path.endsWith(_k))) {
                next();
                return;
            }
            let body = {
                name: name,
                data: {
                    url: req.originalUrl,
                    method: req.method,
                    reqHeaders: headers,
                    reqBody: req.body,
                    timestamp: start,
                    resHeaders: res.getHeaders(),
                    resStatusCode: res.statusCode,
                    source: req.connection.remoteAddress,
                    completionTime: diff,
                    _metadata: { 'deleted': false }
                }
            };
            if (collectionName) {
                body.collectionName = collectionName;
            }
            let bodyStr = JSON.stringify(body);
            try {
                console.log(queueName, bodyStr);
                client.publish(queueName, bodyStr);
            } finally {
                next();
            }
        });
        next();
    };
}

module.exports = logToQueue;
