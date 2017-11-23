import { LocalStorage } from './local.storage';

class DebugSingleton
{
    messages: Array<string> = []
    private date: string;
    private storageKey: string = 'neo4j_debug_log'

    constructor()
    {
        const localMessages = LocalStorage.get(this.storageKey, null)

        if (null !== localMessages) {
            this.messages = localMessages
        }

        const d = new Date()
        this.date = `${d.getFullYear()}-${d.getMonth()}-${d.getDay()} ${d.getHours()}-${d.getMinutes()}-${d.getSeconds()}`
    }

    next()
    {
        const d = new Date()
        this.date = `${d.getFullYear()}-${d.getMonth()}-${d.getDay()} ${d.getHours()}-${d.getMinutes()}-${d.getSeconds()}`
        return this
    }

    log(msg: string|any, category?: string, level: string|'info'|'debug'|'error'|'warning' = 'debug')
    {
        let logEntry: any = {}

        if (typeof(msg) === 'object') {
            logEntry = {
                level: level,
                date: this.date,
                trace: msg,
                category: category,
            }
        } else {
            logEntry = {
                level: level,
                date: this.date,
                trace: msg,
                category: category,
            }
        }

        this.messages.push(JSON.stringify(logEntry))
        LocalStorage.set(this.storageKey, this.messages)
    }

    getMessages(format: string = 'json')
    {
        return (format === 'string') ? this.messages : this.messages.map(msg => { return JSON.parse(msg) })
    }

    clear()
    {
        this.messages = []
        LocalStorage.set(this.storageKey, null)
    }
}

export let Debug = new DebugSingleton()
