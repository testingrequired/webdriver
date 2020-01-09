| Event                           | Payload                             |
| :------------------------------ | :---------------------------------- |
| sessionStart                    | capabilities                        |
| sessionStart:success            | sessionId                           |
| sessionStart:failure            | error                               |
| sessionEnd                      | sessionId                           |
| command                         | url, method, requestBody?           |
| command:success                 | responseBody, response, url, method |
| command:fail                    | response, error                     |
| findElement                     | by                                  |
| findElement:success             | by, elementId                       |
| findElement:fail                | by                                  |
| findElementFromElement          | fromElementId, by                   |
| findElementFromElement:success  | fromElementId, by, elementId        |
| findElementFromElement:fail     | fromElementId, by                   |
| findElements                    | by                                  |
| findElements:success            | by, [...elementIds]                 |
| findElementsFromElement         | fromElementId, by                   |
| findElementsFromElement:success | fromElementId, by, [...elementIds]  |
