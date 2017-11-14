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
}
