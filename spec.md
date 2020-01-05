| Done | Method | Path                                                           | Description                |
| ---- | ------ | -------------------------------------------------------------- | -------------------------- |
| x    | POST   | /session                                                       | New Session                |
| x    | DELETE | /session/{session id}                                          | Delete Session             |
|      | GET    | /status                                                        | Status                     |
|      | GET    | /session/{session id}/timeouts                                 | Get Timeouts               |
| x    | POST   | /session/{session id}/timeouts                                 | Set Timeouts               |
| x    | POST   | /session/{session id}/url                                      | Go                         |
|      | GET    | /session/{session id}/url                                      | Get Current Url            |
|      | POST   | /session/{session id}/back                                     | Back                       |
|      | POST   | /session/{session id}/forward                                  | Forward                    |
|      | POST   | /session/{session id}/refresh                                  | Refresh                    |
|      | GET    | /session/{session id}/title                                    | Get Title                  |
|      | GET    | /session/{session id}/window                                   | Get Window Handle          |
| x    | DELETE | /session/{session id}/window                                   | Close Window               |
|      | POST   | /session/{session id}/window                                   | Switch To Window           |
|      | GET    | /session/{session id}/window/handles                           | Get Window Handles         |
|      | POST   | /session/{session id}/frame                                    | Switch To Frame            |
|      | POST   | /session/{session id}/frame/parent                             | Switch To Parent Frame     |
|      | GET    | /session/{session id}/window/rect                              | Get Window Rect            |
|      | POST   | /session/{session id}/window/rect                              | Set Window Rect            |
|      | POST   | /session/{session id}/window/maximize                          | Maximize                   |
|      | POST   | /session/{session id}/window/minimize                          | Minimize                   |
|      | POST   | /session/{session id}/window/fullscreen                        | Fullscreen                 |
|      | GET    | /session/{session id}/element/active                           | Get Active Element         |
| x    | POST   | /session/{session id}/element                                  | Find Element               |
|      | POST   | /session/{session id}/elements                                 | Find Elements              |
| x    | POST   | /session/{session id}/element/{element id}/element             | Find Element From Element  |
|      | POST   | /session/{session id}/element/{element id}/elements            | Find Element From Elements |
|      | GET    | /session/{session id}/element/{element id}/selected            | Is Element Selected        |
|      | GET    | /session/{session id}/element/{element id}/attribute/{name}    | Get Element Attribute      |
|      | GET    | /session/{session id}/element/{element id}/property/{name}     | Get Element Property       |
|      | GET    | /session/{session id}/element/{element id}/css/{property name} | Get Element CSS Value      |
| x    | GET    | /session/{session id}/element/{element id}/text                | Get Element Text           |
|      | GET    | /session/{session id}/element/{element id}/name                | Get Element Tag Name       |
|      | GET    | /session/{session id}/element/{element id}/rect                | Get Element Rect           |
|      | GET    | /session/{session id}/element/{element id}/enabled             | Is Element Enabled         |
|      | POST   | /session/{session id}/element/{element id}/click               | Element Click              |
|      | POST   | /session/{session id}/element/{element id}/clear               | Element Clear              |
| x    | POST   | /session/{session id}/element/{element id}/value               | Element Send Keys          |
|      | GET    | /session/{session id}/source                                   | Get Page Source            |
| x    | POST   | /session/{session id}/execute/sync                             | Execute Script             |
|      | POST   | /session/{session id}/execute/async                            | Execute Async Script       |
|      | GET    | /session/{session id}/cookie                                   | Get All Cookies            |
|      | GET    | /session/{session id}/cookie/{name}                            | Get Named Cookie           |
|      | POST   | /session/{session id}/cookie                                   | Add Cookie                 |
|      | DELETE | /session/{session id}/cookie/{name}                            | Delete Cookie              |
|      | DELETE | /session/{session id)/cookie                                   | Delete All Cookies         |
|      | POST   | /session/{session id}/actions                                  | Perform Actions            |
|      | DELETE | /session/{session id}/actions                                  | Release Actions            |
|      | POST   | /session/{session id}/alert/dismiss                            | Dismiss Alert              |
|      | POST   | /session/{session id}/alert/accept                             | Accept Alert               |
|      | GET    | /session/{session id}/alert/text                               | Get Alert Text             |
|      | POST   | /session/{session id}/alert/text                               | Send Alert Text            |
|      | GET    | /session/{session id}/screenshot                               | Take Screenshot            |
|      | GET    | /session/{session id}/element/{element id}/screenshot          | Take Element Screenshot    |
