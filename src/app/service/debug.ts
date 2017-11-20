import { LocalStorage } from './local.storage';

class DebugSingleton
{
    messages: Array<string> = []
    private storageKey: string = 'neo4j_debug_log'

    constructor()
    {
        const localMessages = LocalStorage.get(this.storageKey)
        
        if (localMessages !== null) {
            this.messages = localMessages
        }
    }

    log(msg: string|any)
    {
        if (typeof msg !== 'object') {
            msg = JSON.stringify(msg)
        }

        this.messages.push(msg)
        LocalStorage.set(this.storageKey, this.messages)
    }

    logAll(msgs: Array<string>)
    {
        for (let i in msgs) {
            this.log(msgs[i])
        }
    }

    getMessages()
    {
        return this.messages
    }

    clear()
    {
        LocalStorage.set(this.storageKey, null)
        this.messages = null
    }
}

export let Debug = new DebugSingleton()
