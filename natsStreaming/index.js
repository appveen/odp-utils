var NATS = require('node-nats-streaming');
var client = null;
var log4js = require('log4js');
var logger = log4js.getLogger('odp-utils-nats-streaming');
logger.level =  'info';

var init = (clusterName, clientId, config) => {

    client = NATS.connect(clusterName, clientId, config);
    client.on('error', function (err) {
        logger.error(err.message);
    });

    client.on('connect', function () {
        logger.info('NATS connected');
    });

    client.on('disconnect', function () {
        logger.info('NATS disconnect');
    });

    client.on('reconnecting', function () {
        logger.info('NATS reconnecting');
    });

    client.on('reconnect', function () {
        logger.info('NATS reconnect');
    });

    client.on('close', function () {
        logger.info('NATS close');
    });
    return client;
}

module.exports = {
    init: init
};