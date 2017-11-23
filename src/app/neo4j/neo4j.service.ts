import { Injectable }               from '@angular/core';
import { Response }                 from '@angular/http';
import { Headers, Http }            from '@angular/http';
import { Debug, SettingsService }   from '../service';
import { PropertyAccess }           from '../core';
import { ResultSet, Transaction }   from './orm';

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

    commit(trans: Transaction): Promise<any>
    {
        Debug.next().log(trans.getStatements(), 'neo4j.service.transaction.query', 'info')

        return new Promise((resolve, reject) => {
            this.http.post(this.url, { statements: trans.getStatements() }, { headers: this.headers })
                .map(res => res.json())
                .toPromise()
                .then((response: any) => {
                    const result = this.handleResults(response)

                    if (response.errors.length > 0) {
                        Debug.log(response.errors, 'neo4j.service.transaction.error', 'critical')
                        reject(response.errors)
                    } else {
                        Debug.log(result, 'neo4j.service.transaction', 'info')
                        resolve(result)
                    }

                }).catch(err => {
                    Debug.log(err, 'neo4j.service.caught.error', 'critical')
                    throw new Error(err)
                })
        })

    }

    handleResults(response: any)
    {
        let resultSets = [];

        for (let i in response.results) {
            resultSets.push(new ResultSet(response.results[i]))
        }

        for (let i in response.errors) {

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
                }).catch(err => {
                    throw new Error(err)
                })
        })

    }
}
