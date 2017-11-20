import { Injectable }           from '@angular/core';
import { Response }             from '@angular/http';
import { Headers, Http }        from '@angular/http';
import { SettingsService }      from '../service';
import { Debug }                from '../service';
import { PropertyAccess }       from '../core';
import { ResultSet }            from './result-set';
import { Transaction }          from './transaction';

@Injectable()
export class Neo4jService
{
    private url: string;
    private headers: Headers;

    static DEBUG = true
    static NO_DEBUG = false

    constructor(private http: Http, private settings: SettingsService)
    {
        this.headers = new Headers({
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': this.settings.get('client.authBasic')
        })

        const endpoint = this.settings.get('client.apiEndpoint');
        this.url = `${endpoint}/transaction/commit`
    }

    commit(trans: Transaction, noDebug: boolean = Neo4jService.DEBUG): Promise<any>
    {
        if (noDebug === Neo4jService.DEBUG) {
            Debug.logAll(trans.getStatements().map((s) => { return s.statement }))
        }

        return new Promise((resolve, reject) => {
            this.http.post(this.url, { statements: trans.getStatements() }, { headers: this.headers })
                .map(res => res.json())
                .toPromise()
                .then((response: Response) => {
                    const result = this.handleResults(response)
                    resolve(result)
                    
                }).catch(error => {
                    Debug.log(error)
                    reject(error)
                })
        })

    }

    handleResults(response: any)
    {
        let resultSets = [];

        for (let i in response.results) {
            resultSets.push(new ResultSet(response.results[i]))
        }

        return resultSets;
    }

    ping(): Promise<boolean>
    {
        const trans = new Transaction()
        trans.add('MATCH (n) RETURN ID(n) LIMIT 1')

        return new Promise((resolve, reject) => {
            this.http.post(this.url, { statements: trans.getStatements() }, { headers: this.headers })
                .map(res => res.json())
                .toPromise()
                .then((response: Response) => {
                    resolve(true)
                }).catch(error => {
                    Debug.log(error)
                    reject(error)
                })
        })

    }
}
