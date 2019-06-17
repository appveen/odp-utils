var NATS = require('node-nats-streaming');
var client = null;
var log4js = require('log4js');

log4js.configure({
    levels: {
      AUDIT: { value: Number.MAX_VALUE-1, colour: 'yellow' }
    },
    appenders: { out: { type: 'stdout', layout: { type: 'basic' } } },
    categories: { default: { appenders: ['out'], level: 'INFO' } }
  });
var logger = log4js.getLogger('[odp-utils-nats-streaming]');

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