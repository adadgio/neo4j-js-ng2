import { Node } from './node';
import { NodeInterface } from './node-interface';

export class CypherQuery
{
    queryString: string = null;

    queryParts: Array<string> = [];
    queryWhereClauses: Array<string> = [];
    querySetClauses: Array<string> = [];
    queryReturnClauses: Array<string> = [];

    queryLimit: number = null;
    querySkip: number = null;

    constructor()
    {

    }

    matches(alias: string): CypherQuery
    {
        this.queryParts = [`MATCH (${alias})`]
        return this
    }

    returns(clause: string)
    {
        this.queryReturnClauses.push(clause)
        return this
    }

    skip(skip: number)
    {
        this.querySkip = skip
        return this
    }

    limit(limit: number)
    {
        this.queryLimit = limit
        return this
    }

    getQuery(): string
    {
        if (null !== this.queryString) {
            return this.queryString
        }

        this.addQueryParts('WHERE', this.queryWhereClauses)
        this.addQueryParts(null, this.querySetClauses)
        this.addQueryParts('RETURN', this.queryReturnClauses)

        if (null !== this.querySkip) {
            this.queryParts.push(`SKIP ${this.querySkip}`)
        }
        if (null !== this.queryLimit) {
            this.queryParts.push(`LIMIT ${this.queryLimit}`)
        }

        this.queryString = this.queryParts.join(' ')

        return this.queryString
    }

    andWhere(alias: string, prop: string, value: string|number): CypherQuery
    {
        let aliasedProp: string;

        if (['ID', 'ID(?)'].indexOf(prop) > -1) {
            aliasedProp = `ID(${alias})`;
        } else {
            aliasedProp = `${alias}.${prop}`;
        }

        this.queryWhereClauses.push(`${aliasedProp} = ${this.quote(this.escape(value))}`)
        return this
    }

    setProperties(alias: string, properties: any): CypherQuery
    {
        for (let prop in properties) {

            let value = this.quote(this.escape(properties[prop]))
            this.querySetClauses.push(`SET ${alias}.${prop} = ${value}`)
        }

        return this
    }

    setParameter()
    {
        // @todo
    }

    escape(value: any)
    {
        if (value === '' || value === null) {
            return '';
        }
        else if (typeof value  === 'string') {
            value = value.replace("'", "\'");
        }
        else if (typeof value === 'number') {
            value = value;

        } else {
            console.warn(`cypher-query.ts: unsupported escape value ${typeof(value)}`)
        }

        return value;
    }

    quote(value: any)
    {
        if (typeof(value) === 'number') {
            return value
        } else {
            return `'${value}'`
        }
    }

    addQueryParts(prefix: string = null, clauses: Array<string>)
    {
        if (clauses.length === 0) {
            return
        }

        if (null !== prefix) {
            this.queryParts.push(prefix)
        }

        for (let i in clauses) {
            this.queryParts.push(`${clauses[i]}`)
        }
    }
}
