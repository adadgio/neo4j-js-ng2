import { Injectable }       from '@angular/core';
import { Headers, Http }    from '@angular/http';
import { PropertyAccess }   from '../core';

@Injectable()
export class SettingsService
{
    settings: any = {};

    constructor(private http: Http)
    {
        
    }

    set(settings: any)
    {
        this.settings = settings;

        // const accessor = new PropertyAccess()
        // const value = accessor.getValue(this.settings, 'test[1].name')

        return this;
    }

    get(access: string = null)
    {
        const accessor = new PropertyAccess()
        return (null === access) ? this.settings : accessor.getValue(this.settings, access)
    }
}
