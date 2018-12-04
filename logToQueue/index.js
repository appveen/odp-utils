const pathNotToLog = ["/audit", "/audit/count", "/webHookStatus", "/webHookStatus/count", "/logs", "/logs/count", "/health"];
const reqHeaderNotToLog = ['x-forwarded-for', 'dnt', 'authorization', 'access-control-allow-methods', 'content-type', 'access-control-allow-origin', 'accept', 'referer', 'accept-encoding', 'accept-language', 'cookie', 'connection'];
const resHeaderNotToLog = ['x-powered-by', 'access-control-allow-origin', 'content-type', 'content-length', 'etag'];
function deleteProps(obj, properties) {
    for (let property of properties)
        (property in obj) && (delete obj[property]);
}

function logToQueue(name, client, queueName, collectionName) {
    return function (req, res, next) {
        let start = new Date();
        var oldWrite = res.write,
            oldEnd = res.end;
        var chunks = [];

        res.write = function (chunk) {
            chunks.push(new Buffer(chunk));

            oldWrite.apply(res, arguments);
        };

        res.end = function (chunk) {
            if (chunk)
                chunks.push(new Buffer(chunk));

            var body = Buffer.concat(chunks).toString('utf8');
            req.resBody = body;
            oldEnd.apply(res, arguments);
        };
        res.on('finish', function () {
            let end = new Date();
            let diff = end - start;
            let headers = JSON.parse(JSON.stringify(req.headers));[]
            deleteProps(headers, reqHeaderNotToLog);
            if (pathNotToLog.some(_k => req.path.endsWith(_k))) {
                next();
                return;
            }
            let resHeader = res.getHeaders();
            deleteProps(resHeader, resHeaderNotToLog);
            if (Object.keys(resHeader).length === 0) {
                resHeader = null;
            }

            let body = {
                data: {
                    name: name,
                    url: req.originalUrl,
                    method: req.method,
                    txnid: headers.txnid,
                    userId: headers.user,
                    reqBody: req.body,
                    timestamp: start,
                    resHeaders: resHeader,
                    resStatusCode: res.statusCode,
                    source: req.connection.remoteAddress,
                    completionTime: diff,
                    _metadata: { 'deleted': false, 'createdAt': new Date(), 'lastUpdated': new Date() }
                }
            };
            let summary = messages(req,res);
            if(summary){
                body.data.summary = summary;
            }
            if (collectionName) {
                if (req.originalUrl.includes("/rbac/group")) {
                    body.collectionName = 'group.logs';
                }
                else {
                    body.collectionName = collectionName;
                }
            }
            if(req.originalUrl == '/rbac/login' ){
                delete(body.data.reqBody);
            }
            if (req.originalUrl.startsWith('/rbac/usr/USR') && res.statusCode == 200 ) {
                let urlName =  [];
                urlName = req.originalUrl.split('/');
                if(urlName.length==5 && urlName[4] == 'reset'){
                    delete(body.data.reqBody);
                }
                else if(urlName.length==5 && urlName[4] == 'password'){
                    delete(body.data.reqBody);
                }
            }
            let bodyStr = JSON.stringify(body);
            if(req.originalUrl == '/rbac/validate' ){
                next();
            }
            else{
                try {
                    client.publish(queueName, bodyStr);
                } finally {
                    next();
                }
            }            
        });

        next();
    }
}

function messages(req,res) {
    let message = null;
    let resBody = null;
    let urlName =  [];

    if (req.originalUrl == '/rbac/usr' && res.statusCode == 200 && req.method == "POST") {
        resBody = JSON.parse(req.resBody);
        message = req.headers.user + ' added a new user ' + resBody._id;
    }

    else if (req.originalUrl.startsWith('/rbac/usr/') && res.statusCode == 200 && req.method == "DELETE") {
        urlName = req.originalUrl.split('/');
        if(urlName.length==4){
            message = req.headers.user + ' deleted user ' + urlName[3] ;
        }
    }

    else if (req.originalUrl.startsWith('/rbac/usr/') && res.statusCode == 200 && req.method == "PUT") {
        urlName = req.originalUrl.split('/');

        if(urlName.length==5 && urlName[4] == 'reset'){
            message = req.headers.user + ' reset password for user ' + urlName[3] ;
        }
        else if(urlName.length==5 && urlName[4] == 'password'){
            message = urlName[3] + ' changed password ' ;
        }
        else if(urlName.length ==5 && urlName[4] == 'addToGroups'){
            message = req.headers.user + ' added ' + urlName[3] +' to Team '+ req.body.groups ;
        }
        else if(urlName.length ==5 && urlName[4] == 'addToApps'){
            message = req.headers.user + ' added ' + urlName[3] +' to App '+ req.body.apps ;
        }
        else if(urlName.length == 6 && urlName[4] == 'appAdmin' && urlName[5] == 'grant'){
            message = req.headers.user + ' made ' + urlName[3] +' as app admin of App '+ req.body.apps ;
        }
        else if(urlName.length == 6 && urlName[4] == 'appAdmin' && urlName[5] == 'revoke'){
            message = req.headers.user + ' removed ' + urlName[3] +' as app admin of App '+ req.body.apps ;
        }
        else if(urlName.length == 6 && urlName[4] == 'superAdmin' && urlName[5] == 'grant'){
            message = req.headers.user + ' made ' + urlName[3] +' as Super Admin';
        }
        else if(urlName.length == 6 && urlName[4] == 'superAdmin' && urlName[5] == 'revoke'){
            message = req.headers.user + ' removed ' + urlName[3] +' as Super Admin';
        }
        else if(urlName.length == 6  && urlName[5] == 'import'){
            message = req.headers.user + ' created ' + urlName[3];
        }
        else if(urlName.length==4){
            message = req.headers.user + ' updated user ' + urlName[3] ;
        }
    } 

    else if(req.originalUrl.startsWith( '/rbac/usr/app/')&& res.statusCode == 200 && req.method == "POST" && urlName.length == 6  && urlName[5] == 'create'){
        resBody = JSON.parse(req.resBody);
        message = req.headers.user + ' added user ' + resBody._id + 'in app'+ urlName[4] ;
    }

    else if(req.originalUrl == '/rbac/usr/' && res.statusCode == 200 && req.method == "PUT" && urlName.length == 6  && urlName[5] == 'import'){
        message = req.headers.user + ' created ' + urlName[3];
    }

    else if (req.originalUrl == '/rbac/usr/hb' && res.statusCode == 200 && req.method == "PUT") {
        message = ' heart beat of UI ' ;
    }

    else if (req.originalUrl == '/rbac/group' && res.statusCode == 200 && req.method == "POST") {
        resBody = JSON.parse(req.resBody);
        message = req.headers.user + ' added a new group '+ resBody._id;
    }

    else if (req.originalUrl.startsWith('/rbac/group/') && res.statusCode == 200 && req.method == "DELETE") {
        urlName = req.originalUrl.split('/');
        if(urlName.length==4){
            message = req.headers.user + ' deleted team ' + urlName[3] ;
        }
    }

    else if (req.originalUrl.startsWith('/rbac/group/') && res.statusCode == 200 && req.method == "PUT") {
        urlName = req.originalUrl.split('/');
        if(urlName.length==4){
            message = req.headers.user + ' updated team ' + urlName[3] ;
        }
    }

    else if (req.originalUrl == '/rbac/login') {
        if(res.statusCode == 200){
        resBody = JSON.parse(req.resBody);
        message = resBody._id + ' logged in';
        }
        if(res.statusCode != 200){
            resBody = JSON.parse(req.resBody);
            message = 'logged in failed';
        }
    }
    else if (req.originalUrl == '/rbac/logout' && res.statusCode == 200) {
        message = req.headers.user + ' logged out';
    }

    else if (req.originalUrl == '/rbac/preferences' && res.statusCode == 200 && req.method == "POST") {
        message = req.headers.user + ' created preferences ';
    }

    else if (req.originalUrl == '/rbac/refresh' && res.statusCode == 200) {
        message = req.headers.user + ' refreshed token ';
    }

    else if (req.originalUrl.startsWith('/rbac/preferences') && res.statusCode == 200 && req.method == "PUT") {
        urlName = req.originalUrl.split('/');
        message = req.headers.user + ' updated preferences for '+ urlName[2] ;
    }

    else if (req.originalUrl == '/rbac/closeAllSessions' && res.statusCode == 200 && req.method == "DELETE") {
        message = req.headers.user + ' closed all sessions ';
    }
    
    else if (req.originalUrl.startsWith('/rbac/usr/') && res.statusCode == 200 && req.method == "DELETE") {
        urlName = req.originalUrl.split('/');
        if(urlName.length == 5 && urlName[4] == 'closeAllSessions'){
            message = req.headers.user + ' closed sessions for '+urlName[3];
        }
    }

    else if (req.originalUrl == '/rbac/app' && res.statusCode == 200 && req.method == "POST") {
        resBody = JSON.parse(req.resBody);
        message = req.headers.user + ' added a new app '+ resBody._id;
    }

    else if (req.originalUrl.startsWith('/rbac/app/') && res.statusCode == 200 && req.method == "DELETE") {
        urlName = req.originalUrl.split('/');
        if(urlName.length==4){
            message = req.headers.user + ' deleted app ' + urlName[3] ;
        }
    }

    else if (req.originalUrl.startsWith('/rbac/app/') && res.statusCode == 200 && req.method == "PUT") {
        urlName = req.originalUrl.split('/');
        if(urlName.length==4){
            message = req.headers.user + ' updated app ' + urlName[3] ;
        }
    }

    else if (req.originalUrl == '/rbac/role' && res.statusCode == 200 && req.method == "POST") {
        resBody = JSON.parse(req.resBody);
        message = req.headers.user + ' added a new role '+ resBody._id;
    }

    else if (req.originalUrl.startsWith('/rbac/role/') && res.statusCode == 200 && req.method == "DELETE") {
        urlName = req.originalUrl.split('/');
        if(urlName.length==4){
            message = req.headers.user + ' deleted role ' + urlName[3] ;
        }
    }

    else if (req.originalUrl.startsWith('/rbac/role/') && res.statusCode == 200 && req.method == "PUT") {
        urlName = req.originalUrl.split('/');
        if(urlName.length==4){
            message = req.headers.user + ' updated role for ' + urlName[3] ;
        }
        if(urlName.length==5 && urlName[3] == 'updateDefinition' ){
            message = req.headers.user + ' updated definition for ' + urlName[4] ;
        }
    }

    else if (req.originalUrl.startsWith('/rbac/service/') && res.statusCode == 200 && req.method == "POST") {
        urlName = req.originalUrl.split('/');
        if(urlName.length==4){
            message = req.headers.user + ' created service for ' + urlName[3] ;
        }
    }

    else if (req.originalUrl.startsWith('/rbac/service/') && res.statusCode == 200 && req.method == "DELETE") {
        urlName = req.originalUrl.split('/');
        if(urlName.length==4){
            message = req.headers.user + ' deleted service for ' + urlName[3] ;
        }
    }

    else if (req.originalUrl.startsWith('/rbac/library/') && res.statusCode == 200 && req.method == "POST") {
        urlName = req.originalUrl.split('/');
        if(urlName.length==4){
            message = req.headers.user + ' created library for ' + urlName[3] ;
        }
    }

    else if (req.originalUrl.startsWith('/rbac/library/') && res.statusCode == 200 && req.method == "DELETE") {
        urlName = req.originalUrl.split('/');
        if(urlName.length==4){
            message = req.headers.user + ' deleted library for ' + urlName[3] ;
        }
    }

    else if (req.originalUrl.startsWith('/rbac/') && res.statusCode == 200) {
        urlName = req.originalUrl.split('/');
        if(urlName.length==4 && urlName[3] == 'search' && req.method == "POST"){
            message = 'Search users in ldap' ;
        }
        else if(urlName.length==4 && urlName[3] == 'import' && req.method == "POST"){
            message = 'Import LDAP users to local' ;
        }
        else if(urlName.length==4 && urlName[3] == 'test' && req.method == "POST"){
            message = 'Test connection to ldap' ;
        }
        else if(urlName.length==3 && req.method == "POST"){
            message = 'Switch connection to auth' ;
        }
    }
    
    else if (req.originalUrl == '/sm/service' && req.method == "POST") {
        resBody = JSON.parse(req.resBody);
        message = req.headers.user + ' created ' + resBody._id;
    }

    else if (req.originalUrl.startsWith('/sm/service/SRVC') && req.method == "PUT" && res.statusCode == 200) {
        let url = req.originalUrl.split('?');
        urlName = url[0].split('/');
        if(url.endsWith('statusChange')){
            message =  ' status changed '
        }
        else{
            message = req.headers.user + ' updated ' + urlName[3];
        }
    }

    else if (req.originalUrl.startsWith('/sm/service/SRVC') && req.method == "DELETE" && res.statusCode == 200) {
        urlName = req.originalUrl.split('/');
        if(urlName.length === 4){
        message = req.headers.user + ' deleted ' + urlName[3];
        }
    }

    else if (req.originalUrl.startsWith('/sm/SRVC') && req.method == "PUT" && res.statusCode == 200) {
        urlName = req.originalUrl.split('/');
        if(urlName.length === 4 && urlName[3] == "deploy"){
            message = req.headers.user + ' started ' + urlName[2];}
        if(urlName.length === 4 && urlName[3] == "undeploy"){
            message = req.headers.user + ' stopped ' +urlName[2];}
    }

    else if (req.originalUrl.startsWith('/sm/app') && req.method == "DELETE" && res.statusCode == 200) {
        urlName = req.originalUrl.split('/');
        message = req.headers.user + ' delete all the services of  app ' + urlName[2];
    }

    else if (req.originalUrl.endsWith('/service/stop') && req.method == "PUT" && res.statusCode == 200) {
        urlName = req.originalUrl.split('/');
        message = req.headers.user + ' stopped all services of a app ' + urlName[2];
    }

    else if (req.originalUrl.endsWith('/service/start') && req.method == "PUT" && res.statusCode == 200) {
        urlName = req.originalUrl.split('/');
        message = req.headers.user + ' started all services of a app ' + urlName[2];
    }

    if (req.originalUrl == '/sm/globalSchema' && res.statusCode == 200 && req.method == "POST") {
        resBody = JSON.parse(req.resBody);
        message = req.headers.user + ' created globalSchema ' + resBody._id;
    }

    else if (req.originalUrl.startsWith('/sm/globalSchema/') && req.method == "DELETE" && res.statusCode == 200) {
        urlName = req.originalUrl.split('/');
        message = req.headers.user + ' deleted globalSchema  ' + urlName[3];
    }

    else if (req.originalUrl.startsWith('/sm/globalSchema/') && req.method == "PUT" && res.statusCode == 200) {
        urlName = req.originalUrl.split('/');
        message = req.headers.user + ' updated globalSchema ' + urlName[3];
    }

    return message;
}
    

module.exports = logToQueue;

