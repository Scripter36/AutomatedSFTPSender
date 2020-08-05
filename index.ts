import Client from 'ssh2-sftp-client'
import { ConnectConfig } from 'ssh2'
import chokidar from 'chokidar'
import path from 'path'

export default class AutomatedSFTPSender {
    private sftp: Client
    private ready = false
    private connectConfig: ConnectConfig = {}
    private remotePath: string
    private filter: (filePath: string, type: string) => boolean

    constructor (connectConfig: ConnectConfig, remotePath: string) {
        this.connectConfig = connectConfig
        this.remotePath = remotePath
        this.sftp = new Client()
        this.filter = () => true
    }

    connect () {
        this.sftp.connect(this.connectConfig).then(() => {
            this.ready = true
            console.log('connected')
        }).catch((error) => {
            console.error(error)
        })
    }

    watch (watchPath: string, options?: chokidar.WatchOptions) {
        const watcher = chokidar.watch(watchPath, options)
        watcher.on('add', filePath => {
            if (this.filter(filePath, 'add')) this.upload(filePath, path.relative(watchPath, filePath))
        })
        watcher.on('change', filePath => {
            if (this.filter(filePath, 'change')) this.upload(filePath, path.relative(watchPath, filePath))
        })
        watcher.on('unlink', filePath => {
            if (this.filter(filePath, 'unlink')) this.delete(path.relative(watchPath, filePath))
        })
        watcher.on('addDir', filePath => {
            if (this.filter(filePath, 'addDir')) this.mkdir(path.relative(watchPath, filePath))
        })
        watcher.on('unlinkDir', filePath => {
            if (this.filter(filePath, 'unlinkDir')) this.rmdir(path.relative(watchPath, filePath))
        })
        watcher.on('error', error => console.log(`Watcher error: ${error}`))
        watcher.on('ready', () => console.log('Initial scan complete. Ready for changes'))
    }

    upload (clientPath: string, serverPath: string) {
        if (!this.ready) return
        const remotePath = path.join(this.remotePath, serverPath).replace(/\\/g, '/')
        setTimeout(() => {
            this.sftp.fastPut(clientPath, remotePath).then(() => {
                console.log(`sent ${clientPath} to ${remotePath}`)
            }).catch((error) => {
                console.error(error)
            })
        }, 100)
    }

    delete (serverPath: string) {
        if (!this.ready) return
        const remotePath = path.join(this.remotePath, serverPath).replace(/\\/g, '/')
        setTimeout(() => {
            this.sftp.delete(remotePath).then(() => {
                console.log(`deleted ${remotePath}`)
            }).catch((error) => {
                console.error(error)
            })
        }, 100)
    }

    mkdir (serverPath: string) {
        if (!this.ready) return
        const remotePath = path.join(this.remotePath, serverPath).replace(/\\/g, '/')
        setTimeout(() => {
            this.sftp.mkdir(remotePath).then(() => {
                console.log(`Created folder ${remotePath}`)
            }).catch((error) => {
                console.error(error)
            })
        }, 100)
    }

    rmdir (serverPath: string) {
        if (!this.ready) return
        const remotePath = path.join(this.remotePath, serverPath).replace(/\\/g, '/')
        setTimeout(() => {
            this.sftp.rmdir(remotePath, true).then(() => {
                console.log(`Removed folder ${remotePath}`)
            }).catch((error) => {
                console.error(error)
            })
        }, 100)
    }

    setFilter (filter: (filePath: string, type: string) => boolean) {
        this.filter = filter
    }
}
