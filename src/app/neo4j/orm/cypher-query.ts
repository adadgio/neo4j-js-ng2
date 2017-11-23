import { Node, NodeInterface } from '../model';
import { escape }               from '../../core/string';

export class CypherQuery
{
    queryString: string = null;

    queryParts: Array<string> = [];
    queryCreateClauses: Array<string> = [];
    queryWhereClauses: Array<string> = [];
    querySetPropsClauses: Array<string> = [];
    queryReturnClauses: Array<string> = [];
    queryRemovePropsClauses: Array<string> = [];

    queryLimit: number = null;
    querySkip: number = null;

    constructor()
    {
        this.clear()
    }

    clear()
    {
        this.queryString = null;

        this.queryParts = [];
        this.queryCreateClauses = [];
        this.queryWhereClauses = [];
        this.querySetPropsClauses = [];
        this.queryReturnClauses = [];
        this.queryRemovePropsClauses = [];

        this.queryLimit = null;
        this.querySkip = null;

        return this
    }

    create(alias: string, labels: Array<string> = null): CypherQuery
    {
        let clause: string;

        if (null !== labels) {
            let labelStr = labels.join(':')
            clause = `CREATE (${alias}:${labelStr})`
        } else {
            clause = `CREATE (${alias})`
        }

        this.queryCreateClauses = [clause]
        return this
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

    removeProperties(alias: string, properties: any): CypherQuery
    {
        for (let prop in properties) {
            this.queryRemovePropsClauses.push(`REMOVE ${alias}.${prop}`)
        }
        return this
    }

    getQuery(): string
    {
        if (null !== this.queryString) {
            return this.queryString
        }

        this.addQueryParts(null, this.queryCreateClauses)
        this.addQueryParts('WHERE', this.queryWhereClauses)
        this.addQueryParts(null, this.querySetPropsClauses)
        this.addQueryParts(null, this.queryRemovePropsClauses)
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

        this.queryWhereClauses.push(`${aliasedProp} = ${this.quote(escape(value))}`)
        return this
    }

    setProperties(alias: string, properties: any): CypherQuery
    {
        for (let prop in properties) {

            let value = this.quote(escape(properties[prop]))
            this.querySetPropsClauses.push(`SET ${alias}.${prop} = ${value}`)
        }

        return this
    }

    setParameter()
    {
        // @todo
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
