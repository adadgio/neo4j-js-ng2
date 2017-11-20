import { Node } from './node';
import { NodeInterface } from './node-interface';

type Statement = {
    statement: string;
    parameters: any;
}

export class Transaction
{
    statements: Array<Statement> = [];

    constructor(statements: Array<Statement> = [])
    {
        this.statements = statements;
    }

    add(query: string, params: any = {})
    {
        const statement: Statement = { statement: query, parameters: params }
        this.statements.push(statement)
    }

    getStatements()
    {
        return this.statements
    }

    matchByIdAndSetStatement(node: NodeInterface)
    {
        let cypher: Array<string> = [`MATCH (n) WHERE ID(n)`];

        for (let prop in node.properties()) {
            
            let value = this.escape(node.get(prop));

            cypher.push(`SET n.{prop} = '${value}'`)
        }

        return cypher.join(' ');
    }

    escape(value: any)
    {
        if (typeof(value) === 'string') {
            return value.replace("'", "\'");
        } else {
            console.warn(`transaction.ts: unsupported escape value ${typeof(value)}`)
        }
    }
}
