let exec = require('child_process').exec;
let e = {};

function execCommand(command, errMsg) {
    return new Promise((resolve, reject) => {
        exec(command, (_err, _stdout) => {
            if (_err) {
                logger.error(`ERROR :: ${command}`);
                logger.error(_err);
                return reject(new Error(errMsg));
            }
            logger.info(`SUCCESS :: ${command}`);
            logger.debug(_stdout);
            return resolve(_stdout);
        });
    })
}

e.createSecret = function (ns) {
    if (process.env.DOCKER_USER && process.env.DOCKER_PASSWORD && process.env.DOCKER_HOST && process.env.DOCKER_EMAIL) {
        logger.info("Creating secret");
        let command = `kubectl create secret docker-registry regsecret --docker-server=${process.env.DOCKER_HOST} --docker-username=${process.env.DOCKER_USER} --docker-password=${process.env.DOCKER_PASSWORD} --docker-email=${process.env.DOCKER_EMAIL} --namespace ${ns}`
        return execCommand(command, "Could not create docker image pull secret");
    } else {
        logger.info("Information to create secret not found");
        return Promise.resolve();
    }
}

module.exports = e;