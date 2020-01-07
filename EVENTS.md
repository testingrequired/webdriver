| Event                          | Payload                              |
| :----------------------------- | :----------------------------------- |
| startSession                   | sessionId, capabilities              |
| command                        | url, method, requestBody?, requestId |
| command:success                | responseBody, requestId              |
| command:success:requestId      | responseBody                         |
| command:fail                   | requestId, error                     |
| command:fail:requestId         | error                                |
| endSession                     | sessionId                            |
| endSession:sessionId           |                                      |
| findElement                    | by, requestId                        |
| findElement:success            | elementId, requestId                 |
| findElement:success:requestId  | elementId                            |
| findElement:fail               | error, requestId                     |
| findElement:fail:requestId     | error                                |
| findElements                   | by, requestId                        |
| findElements:success           | [...elementIds], requestId           |
| findElements:success:requestId | [...elementIds]                      |
| findElements:fail              | error, requestId                     |
| findElements:fail:requestId    | error                                |
