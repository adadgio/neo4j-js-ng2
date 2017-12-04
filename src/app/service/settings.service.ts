import { Injectable, Optional }     from '@angular/core';
import { Headers, Http }            from '@angular/http';
import { PropertyAccess }           from '../core';
import { LocalStorage }             from './local.storage';

@Injectable()
export class SettingsService
{
    settings: any = {}
    inited: boolean = false

    private storageKey: string = 'neo4j_settings'

    constructor(@Optional() private http: Http)
    {
        // try to read data from local storage first
        const localSettings = LocalStorage.get(this.storageKey)

        if (localSettings !== null) {
            this.set(localSettings)
            console.warn(`settings.service.ts Neo4j settings loaded from local storage`)
        }
    }

    areSet()
    {
        return this.inited
    }

    reset()
    {
        this.settings = {}
        LocalStorage.remove(this.storageKey)
        return this
    }

    set(settings: any, force: boolean = false)
    {
        if (true === this.areSet() && force !== true) {
            return this
        }

        this.settings = settings;
        LocalStorage.set(this.storageKey, settings)

        this.inited = true
        return this
    }

    get(access: string = null)
    {
        const accessor = new PropertyAccess()
        return (null === access) ? this.settings : accessor.getValue(this.settings, access)
    }
}
