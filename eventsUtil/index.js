var helperUtil = require('@appveen/odp-utils/eventsUtil/constants');
var eventPriorityMap = helperUtil.eventPriorityMap;
var client = null;

function setNatsClient(natsClient) {
    client = natsClient;
}

function publishEvent(eventId, source, req, doc) {
    let logger = global.logger;
    let payload = {
        "eventId" : eventId,
        "source": source,
        "documentId" : doc._id,
        "documentName" : doc.name,
        "app": doc.app,
        "triggerType" : "user",
        "triggerId" : req.get('user'),
        "timestamp": new Date().toISOString(),
        "priority" : eventPriorityMap[eventId],
        "txnId" : req.get('txnId')
    }
    if(client) {
        client.publish('events', JSON.stringify(payload));
        logger.info('Event published');
    } else {
        logger.error('client not found to publish events');
    }
}

module.exports = {
    setNatsClient: setNatsClient,
    publishEvent: publishEvent
}