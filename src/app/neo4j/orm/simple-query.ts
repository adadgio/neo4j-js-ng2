import { Node, NodeInterface }  from '../model';
import { escape }               from '../utils';

export class SimpleQuery
{
    queryString: string;

    constructor(string: string, relLevel: number = 1, limit: number = null, skip: number = null)
    {
        // simple query expression looks like
        // ":Person id=3 name=3"

        let labels = '';
        let properties  = [];

        // match labels filter like ":Label1:Label2:..."
        const labelsRegex = new RegExp(/(:[a-zA-Z0-9_:]+)\s{0,}/);
        const propertiesMatch = new RegExp(/\s([a-z\]+)=([a-z0-9A-Z\s]+)\s?/);


        const labelsMatch = string.match(labelsRegex);
        labels = (labelsMatch) ? labelsMatch[1] : '';

        const propMatch = string.match(propertiesMatch);
        if (propMatch) {
            properties = this.matchPropsToArrayOfEqualities(propMatch[1])
        }


        // start building the full cypher query string
        let queryString = `MATCH (a${labels}`;

        if (properties.length > 0) {
            queryString += ` {${properties.join(', ')}}`;
        }

        // @todo only one level of relationships is supported
        if (relLevel === 1) {
            queryString += `)-[r]->(b) RETURN a, b, r, ID(a), ID(b), TYPE(r), LABELS(a), LABELS(b)${this.addLimitAndSkip(limit, skip)}`;

        } else {
            
            queryString += `) RETURN a, ID(a), LABELS(a)${this.addLimitAndSkip(limit, skip)}`;
        }

        if (relLevel > 1) {
            console.warn(`simple-query.ts Only one level of relationship is supported in a simple query expression`)
        }

        this.queryString = queryString;
    }

    private addLimitAndSkip(limit: number = null, skip: number = null)
    {
        let str = '';

        if (null !== limit) {
            str = ` LIMIT ${limit}`;
        }

        if (null !== skip) {
            str = ` SKIP ${skip}`;
        }

        return str;
    }

    /**
     * Turn a string like "id=3, name=ben" into
     * an array of ["id=3", "name='Ben'"]
     */
    private matchPropsToArrayOfEqualities(propMatch: string): Array<any>
    {
        let properties  = [];



        let props = propMatch[1].split(' ');

        for (let i=0; i < props.length; i++) {
            const expl  = props[i].split('=');
            const exprs = expl[0] + ":'" + escape(expl[1]) + "'";

            properties.push(exprs);
        }

        return properties;
    }

    getQuery()
    {
        return this.queryString;
    }
}
