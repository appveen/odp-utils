# unagiutils
Common utils for Project X

## Audit Trail
This lib contain hooks to create audit logs in a specific DB. This DB will store all the logs of data change.

To store the logs, the node service should invoke the following hooks provided by the lib.

1. getAuditPreSaveHook: This will return hook for pre save. collectionName(where the document is stored) has to be passed as an argument.

2. getAuditPostSaveHook: This will return hook for post save. collectionName(where the audit log should be stored) has to be passed as an argument.

3. getAuditPreRemoveHook: This will return hook for pre remove. No argument needed.

4. getAuditPostRemoveHook: This will return hook for post remove. collectionName(where the audit log should be stored) has to be passed as an argument.

To record txnId and username in the audit log, one has to pass req object in the save method at the time of document creation. 
