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
    }
    connect() {
        this.sftp.connect(this.connectConfig).then(() => {
            this.ready = true;
            console.log('connected');
        });
    }
    watch(watchPath, options) {
        const watcher = chokidar_1.default.watch(watchPath, options);
        watcher.on('add', filePath => this.upload(filePath, path_1.default.relative(watchPath, filePath)));
        watcher.on('change', filePath => this.upload(filePath, path_1.default.relative(watchPath, filePath)));
        watcher.on('unlink', filePath => this.delete(path_1.default.relative(watchPath, filePath)));
        watcher.on('addDir', filePath => this.mkdir(path_1.default.relative(watchPath, filePath)));
        watcher.on('unlinkDir', filePath => this.rmdir(path_1.default.relative(watchPath, filePath)));
        watcher.on('error', error => console.log(`Watcher error: ${error}`));
        watcher.on('ready', () => console.log('Initial scan complete. Ready for changes'));
    }
    upload(absolutePath, relativePath) {
        if (!this.ready)
            return;
        const remotePath = path_1.default.resolve(this.remotePath, relativePath);
        setTimeout(() => {
            this.sftp.fastPut(absolutePath, remotePath).then(() => {
                console.log(`sent ${absolutePath} to ${remotePath}`);
            }).catch(() => {
                // Do Nothing
            });
        }, 100);
    }
    delete(relativePath) {
        if (!this.ready)
            return;
        const remotePath = path_1.default.resolve(this.remotePath, relativePath);
        setTimeout(() => {
            this.sftp.delete(remotePath).then(() => {
                console.log(`deleted ${remotePath}`);
            }).catch(() => {
                // Do Nothing
            });
        }, 100);
    }
    mkdir(relativePath) {
        if (!this.ready)
            return;
        const remotePath = path_1.default.resolve(this.remotePath, relativePath);
        setTimeout(() => {
            this.sftp.mkdir(remotePath).then(() => {
                console.log(`Created folder ${remotePath}`);
            }).catch(() => {
                // Do Nothing
            });
        }, 100);
    }
    rmdir(relativePath) {
        if (!this.ready)
            return;
        const remotePath = path_1.default.resolve(this.remotePath, relativePath);
        setTimeout(() => {
            this.sftp.rmdir(remotePath, true).then(() => {
                console.log(`Removed folder ${remotePath}`);
            }).catch(() => {
                // Do Nothing
            });
        }, 100);
    }
}
exports.AutomatedSFTPSender = AutomatedSFTPSender;
