import * as moment from 'moment';
import { LocalStorage } from './local.storage';
import { uuid } from '../core';
import { orderBy } from '../core/array';

class DebugSingleton
{
    private uuid: string;
    private timestamp: number;
    private groupName: string;

    private messages: Array<string> = [];
    private storageKey: string = 'neo4j_debug_log';

    constructor()
    {
        this.uuid = uuid()
        const localMessages = LocalStorage.get(this.storageKey, null)

        if (null !== localMessages) {
            this.messages = localMessages;
        }

        this.timestamp = moment().valueOf();
    }

    group(name: string = 'Debug group')
    {
        this.groupName = name;
        this.uuid = uuid();
        this.timestamp = moment().valueOf();
        return this
    }

    log(msg: string|any, category?: string, level: string|'info'|'debug'|'error'|'warning' = 'debug')
    {
        let logEntry: any = {}

        if (typeof(msg) === 'object') {
            logEntry = {
                level: level,
                timestamp: this.timestamp,
                trace: msg,
                category: category,
            }
        } else {
            logEntry = {
                level: level,
                timestamp: this.timestamp,
                trace: msg,
                category: category,
            }
        }

        this.messages.push(JSON.stringify(logEntry))
        LocalStorage.set(this.storageKey, this.messages)
    }

    getMessages(format: string = 'json')
    {
        const messages = this.messages.map(msg => { return JSON.parse(msg) })
        return orderBy('timestamp', messages)
    }

    countErrorsByLevel(level: string)
    {
        let count: number = 0;
        const messages = this.messages.map(msg => { return JSON.parse(msg) })

        for (let i in messages) {
            if (messages[i].level === level) {
                count++;
            }
        }
        return count;
    }

    clear()
    {
        this.messages = []
        LocalStorage.set(this.storageKey, null)
    }
}

export let Debug = new DebugSingleton()
