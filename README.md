# AutomatedSFTPSender

Watches your project folder, and sends changes to server via SFTP.

## Methods
* `constructor(connectConfig: ConnectConfig, remotePath: string)`

ConnectConfig: See [https://github.com/mscdex/ssh2#client-methods](https://github.com/mscdex/ssh2#client-methods) `connect(< object >config)`

remotePath: the `server` folder path where you want to synchronize with your project folder

----

* `connect()`

----

connects to server

* `watch(watchPath: string, options?: chokidar.WatchOptions)`

watchPath: your `project` folder where you want to synchronize with the server folder

options?: see [https://github.com/paulmillr/chokidar#api](https://github.com/paulmillr/chokidar#api) `options`

----

starts watching your project folder.

* `upload (clientPath: string, serverPath: string)`
* `delete (serverPath: string)`
* `mkdir (serverPath: string)`
* `rmdir (serverPath: string)`

clientPath: path of your project file

serverPath: path where your project file goes | path of the server file / folder that will be created / deleted

----

these methods will be executed when your project files change, but you can also execute directly.

* `setFilter (filter: (filePath: string, type: string) => boolean)`

filter: filter function

type: event type `(add|change|unlink|addDir|unlinkDir)`

----

Filters whether your changed files will be sent to server or not. `(true: send, false: ignore)`

## Examples

```javascript
import AutomatedSFTPSender from 'AutomatedSFTPSender'
import path from 'path'

const sender = new AutomatedSFTPSender({
  host: 'example.com', // Your server host
  port: 22, // SFTP port
  username: 'admin',
  password: 'admin'
}, '/root/server/build') // where your project file will be synchronized

sender.connect() // connects to server
sender.watch(path.resolve(__dirname, 'build'), { // ./build/ folder will be synchronized
  ignoreInitial: true // ignores initial detection. if false, error can be thrown
})
```