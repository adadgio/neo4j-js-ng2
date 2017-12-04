import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { Headers, Http } from '@angular/http';
import { SettingsService } from './service';

/**
 * @return Promise
 */
export function bootstrap(http: Http, settings: SettingsService)
{
    let promises: Array<Promise<any>> = [];
    const headers = new Headers({ 'Content-Type': 'application/json' })

    if (true === settings.areSet()) {

        promises[0] = Promise.resolve()

    } else {
        
        promises[0] =  new Promise((resolve, reject) => {
            http.get('assets/neo4j.settings.json', { headers: headers })
                .map(res => res.json())
                .toPromise()
                .then(data => {
                    settings.set(data)
                    resolve(data)
                }).catch(err => {
                    throw new Error(err)
                })
        })

    }

    return () => { return Promise.all(promises) };
};
