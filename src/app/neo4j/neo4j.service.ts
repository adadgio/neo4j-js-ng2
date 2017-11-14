import { Injectable }           from '@angular/core';
import { Response }             from '@angular/http';
import { Headers, Http }        from '@angular/http';
import { SettingsService }      from '../service';
import { PropertyAccess }       from '../core';
import { ResultSet }            from './result-set';
import { Transaction }          from './transaction';

@Injectable()
export class Neo4jService
{
    headers: Headers;

    constructor(private http: Http, private settings: SettingsService)
    {
        this.headers = new Headers({
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': this.settings.get('client.authBasic')
        })
    }

    commit(trans: Transaction)
    {
        const headers = this.headers;
        const endpoint = this.settings.get('client.apiEndpoint');
        const url = `${endpoint}/transaction/commit`;

        return new Promise((resolve, reject) => {
            this.http.post(url, { statements: trans.getStatements() }, { headers: this.headers })
                .map(res => res.json())
                .toPromise()
                .then((response: Response) => {
                    const result = this.handleResults(response)
                    resolve(result)

                }).catch(error => {
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
}
