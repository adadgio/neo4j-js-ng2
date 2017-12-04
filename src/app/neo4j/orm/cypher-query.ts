import { Node, NodeInterface }  from '../model';
import { escape, quote }        from '../utils';

export class CypherQuery
{
    queryString: string = null;

    queryParts: Array<string> = [];
    queryCreateClauses: Array<string> = [];
    queryWhereClauses: Array<string> = [];
    querySetLabelsClause: string = null;
    queryRmLabelsClause: string = null;
    querySetPropsClauses: Array<string> = [];
    queryReturnClauses: Array<string> = [];
    queryRemovePropsClauses: Array<string> = [];

    queryLimit: number = null;
    querySkip: number = null;

    queryNativeParts: Array<string> = [];

    public static RAW_QUERY_PART = true;

    constructor()
    {
        this.clear()
    }

    rawCypher(rawQueryString: string)
    {
        this.queryString = rawQueryString;
        return this;
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
        this.querySetLabelsClause = null;
        this.queryRmLabelsClause = null;

        this.queryLimit = null;
        this.querySkip = null;

        this.queryNativeParts = [];

        return this
    }

    addNative(queryString: string)
    {
        this.queryNativeParts.push(queryString)
        return this;
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
        return this;
    }

    matches(alias: string, raw: boolean = false): CypherQuery
    {
        this.queryParts = (raw === CypherQuery.RAW_QUERY_PART) ? [alias] : [`MATCH (${alias})`];

        return this
    }

    returns(clause: string)
    {
        this.queryReturnClauses.push(clause)
        return this;
    }

    skip(skip: number)
    {
        this.querySkip = skip
        return this;
    }

    limit(limit: number)
    {
        this.queryLimit = limit
        return this;
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

        this.addQueryParts(null, [this.querySetLabelsClause])
        this.addQueryParts(null, [this.queryRmLabelsClause])
        
        this.addQueryParts(null, this.queryNativeParts)

        this.addQueryParts('RETURN', this.queryReturnClauses)

        if (null !== this.querySkip) {
            this.queryParts.push(`SKIP ${this.querySkip}`)
        }
        if (null !== this.queryLimit) {
            this.queryParts.push(`LIMIT ${this.queryLimit}`)
        }

        this.queryString = this.queryParts.join(' ')
        return this.queryString;
    }

    andWhere(alias: string, prop: string, value: string|number): CypherQuery
    {
        let aliasedProp: string;

        if (['ID', 'ID(?)'].indexOf(prop) > -1) {
            aliasedProp = `ID(${alias})`;
        } else {
            aliasedProp = `${alias}.${prop}`;
        }

        this.queryWhereClauses.push(`${aliasedProp} = ${quote(escape(value))}`)
        return this;
    }

    setProperties(alias: string, properties: any): CypherQuery
    {
        for (let prop in properties) {

            let value = quote(escape(properties[prop]))
            this.querySetPropsClauses.push(`SET ${alias}.${prop} = ${value}`)
        }

        return this;
    }

    removeProperties(alias: string, properties: any): CypherQuery
    {
        for (let prop in properties) {
            this.queryRemovePropsClauses.push(`REMOVE ${alias}.${prop}`)
        }
        return this;
    }

    setLabels(alias: string, labels: Array<string> = null)
    {
        if (null === labels || labels.length === 0) {
            return this;
        }

        let labelsSuite = labels.join(':');
        this.querySetLabelsClause = `SET ${alias}:${labelsSuite}`;
        return this;
    }

    removeLabels(alias: string, labels: Array<string> = null)
    {
        if (null === labels || labels.length === 0) {
            return this;
        }

        let labelsSuite = labels.join(':');
        this.queryRmLabelsClause = `REMOVE ${alias}:${labelsSuite}`;
        return this;
    }

    setParameter()
    {
        // @todo
    }

    addQueryParts(prefix: string = null, clauses: Array<string>)
    {
        if (clauses.length === 0) {
            return;
        }

        if (null !== prefix) {
            this.queryParts.push(prefix)
        }

        for (let i in clauses) {
            if (null === clauses[i]) { continue; }
            this.queryParts.push(`${clauses[i]}`)
        }
    }
}
