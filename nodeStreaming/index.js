let e = {};
var NATS = require('node-nats-streaming');
var client = null;
var init= (clientId,clusterName,config) =>{

    client = NATS.connect(clusterName,clientId , config);
    const logger = global.logger;
    client.on('error', function(err) {
        logger.error(err.message);
    });
     
    client.on('connect', function() {
        logger.info('NATS connected');
    });
     
    client.on('disconnect', function() {
        logger.info('NATS disconnect');
    });
     
    client.on('reconnecting', function() {
        logger.info('NATS reconnecting');
    });
     
    client.on('reconnect', function() {
        logger.info('NATS reconnect');
    });
     
    client.on('close', function() {
        logger.info('NATS close');
    });
}

module.exports = {
 init:init
};