import { Node, NodeInterface }  from '../model';
import { escape, quote }        from '../utils';

export class SimpleQuery
{
    queryString: string;

    constructor(string: string, relLevel: number = 1)
    {
        // simple query expression looks like
        // ":Person id=3 name=3"

        let labels = '';
        let where: string = null;
        let properties  = [];
        let limit: number = null;
        let skip: number = null;

        // match labels filter like ":Label1:Label2:..."
        const labelsRegex = new RegExp(/(:[a-zA-Z0-9_:]+)\s{0,}/);
        const propertiesMatch = new RegExp(/((?:[a-z0-9]+)=(("[\w\s]+"){1}|([\S]+)))/gi);
        const limitSkipMatch = new RegExp(/([0-9,\s]+)$/i);

        const labelsMatch = string.match(labelsRegex);
        labels = (labelsMatch) ? labelsMatch[1] : '';

        const propsMatch = string.match(propertiesMatch);
        if (propsMatch) {
            const whereClauses = this.andWhereProps(propsMatch)
            if (whereClauses.length > 0) {
                where = `${whereClauses.join(' AND ')}`;
            }
        }

        const skipLimitMatch = string.match(limitSkipMatch);
        if (skipLimitMatch) {
            const parts = skipLimitMatch[0].split(',').map(v => { return v.trim() });

            if (parts.length === 2) {
                limit = parseInt(parts[0])
                skip = parseInt(parts[1])
            } else if (parts.length === 1) {
                limit = parseInt(parts[0])
                skip = null
            }
        }

        // build cypher query string
        let queryString = `MATCH (a${labels})`;
        if (null !== where) {
            queryString += ` WHERE ${where}`;
        }

        // @todo only one level of relationships is supported
        if (relLevel === 1) {
            queryString += `-[r]->(b) RETURN a, b, r, ID(a), ID(b), TYPE(r), LABELS(a), LABELS(b)`;
        } else {
            queryString += ` RETURN a, ID(a), LABELS(a)`;
        }

        if (relLevel > 1) {
            console.warn(`simple-query.ts Only one level of relationship is supported in a simple query expression`)
        }
        
        if (null !== skip) {
            queryString += ` SKIP ${skip}`;
        }
        if (null !== limit) {
            queryString += ` LIMIT ${limit}`;
        }


        this.queryString = queryString;
    }

    /**
     * Turn a string like "id=3, name=ben" into
     * an array of ["id=3", "name='Ben'"]
     */
    private andWhereProps(matches: any): Array<any>
    {
        let whereClauses  = [];

        for (let i=0; i < matches.length; i++) {
            const parts = matches[i].split('=').map(v => { return v.trim() } );
            let value = parts[1].replace(/"/g, '');
            const prop = parts[0].trim() // { property: parts[0].trim(), value: escape(value) }
            whereClauses.push(`a.${prop}=${quote(escape(value))}`)
        }

        return whereClauses;
    }

    getQuery()
    {
        return this.queryString;
    }
}
