"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ssh2_sftp_client_1 = __importDefault(require("ssh2-sftp-client"));
const chokidar_1 = __importDefault(require("chokidar"));
const path_1 = __importDefault(require("path"));
class AutomatedSFTPSender {
    constructor(connectConfig, remotePath) {
        this.ready = false;
        this.connectConfig = {};
        this.connectConfig = connectConfig;
        this.remotePath = remotePath;
        this.sftp = new ssh2_sftp_client_1.default();
        this.filter = () => true;
    }
    connect() {
        this.sftp.connect(this.connectConfig).then(() => {
            this.ready = true;
            console.log('connected');
        });
    }
    watch(watchPath, options) {
        const watcher = chokidar_1.default.watch(watchPath, options);
        watcher.on('add', filePath => {
            if (this.filter(filePath, 'add'))
                this.upload(filePath, path_1.default.relative(watchPath, filePath));
        });
        watcher.on('change', filePath => {
            if (this.filter(filePath, 'change'))
                this.upload(filePath, path_1.default.relative(watchPath, filePath));
        });
        watcher.on('unlink', filePath => {
            if (this.filter(filePath, 'unlink'))
                this.delete(path_1.default.relative(watchPath, filePath));
        });
        watcher.on('addDir', filePath => {
            if (this.filter(filePath, 'addDir'))
                this.mkdir(path_1.default.relative(watchPath, filePath));
        });
        watcher.on('unlinkDir', filePath => {
            if (this.filter(filePath, 'unlinkDir'))
                this.rmdir(path_1.default.relative(watchPath, filePath));
        });
        watcher.on('error', error => console.log(`Watcher error: ${error}`));
        watcher.on('ready', () => console.log('Initial scan complete. Ready for changes'));
    }
    upload(clientPath, serverPath) {
        if (!this.ready)
            return;
        const remotePath = path_1.default.resolve(this.remotePath, serverPath);
        setTimeout(() => {
            this.sftp.fastPut(clientPath, remotePath).then(() => {
                console.log(`sent ${clientPath} to ${remotePath}`);
            }).catch((error) => {
                console.error(error);
            });
        }, 100);
    }
    delete(serverPath) {
        if (!this.ready)
            return;
        const remotePath = path_1.default.resolve(this.remotePath, serverPath);
        setTimeout(() => {
            this.sftp.delete(remotePath).then(() => {
                console.log(`deleted ${remotePath}`);
            }).catch((error) => {
                console.error(error);
            });
        }, 100);
    }
    mkdir(serverPath) {
        if (!this.ready)
            return;
        const remotePath = path_1.default.resolve(this.remotePath, serverPath);
        setTimeout(() => {
            this.sftp.mkdir(remotePath).then(() => {
                console.log(`Created folder ${remotePath}`);
            }).catch((error) => {
                console.error(error);
            });
        }, 100);
    }
    rmdir(serverPath) {
        if (!this.ready)
            return;
        const remotePath = path_1.default.resolve(this.remotePath, serverPath);
        setTimeout(() => {
            this.sftp.rmdir(remotePath, true).then(() => {
                console.log(`Removed folder ${remotePath}`);
            }).catch((error) => {
                console.error(error);
            });
        }, 100);
    }
    setFilter(filter) {
        this.filter = filter;
    }
}
exports.default = AutomatedSFTPSender;
