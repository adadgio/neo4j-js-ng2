import { Injectable }               from '@angular/core';
import { Neo4jService }             from './neo4j.service';
import { ResultSet, Transaction }   from '../neo4j/orm';
import { CypherQuery, SimpleQuery } from '../neo4j/orm';
import { Node, NodeInterface }      from '../neo4j/model';
import { distinct, crosscut }       from '../core/array';

/**
 * Just short methods for useful top user operations.
 * Enhance it as you wish using the tools demonstrated bellow.
 */
@Injectable()
export class Neo4jRepository
{
    constructor(private neo4j: Neo4jService)
    {

    }

    persistNode(node: NodeInterface): Promise<NodeInterface>
    {
        const builder = new CypherQuery()

        // build a query string to pass to a transaction
        const query = builder
            .create('n', node.getLabels())
            .setProperties('n', node.properties())
            .returns('n, ID(n), LABELS(n)')
            .limit(1)
            .getQuery()

        const transaction = new Transaction()
        transaction.add(query)

        return new Promise((resolve, reject) => {
            this.neo4j.commit(transaction).then((resultSets: Array<ResultSet>) => {

                let node = resultSets[0].getDataset('n').first()
                console.log(node)
                resolve(node)

            }).catch(err => {
                throw new Error(err)
            })
        })
    }

    updateNodeById(id: number, changedProperties: any, removedProperties: any, labels: Array<string> = null): Promise<Array<ResultSet>>
    {
        const builder = new CypherQuery()
        
        // build a query string to pass to a transaction
        const query = builder
            .matches('n')
            .andWhere('n', 'ID(?)', id)
            .setLabels('n', labels)
            .setProperties('n', changedProperties)
            .removeProperties('n', removedProperties)
            .returns('n, ID(n), LABELS(n)')
            .skip(0)
            .limit(1)
            .getQuery();

        const transaction = new Transaction()
        transaction.add(query)
        console.log(query)

        return this.neo4j.commit(transaction)
    }

    findRelationshipsById(id: number)
    {
        const transaction = new Transaction()
        transaction.add(`MATCH (a)-[r]-(b) WHERE ID(a) = ${id} RETURN a, b, ID(a), ID(b), LABELS(a), LABELS(b), r, ID(r), TYPE(r)`)

        return new Promise((resolve, reject) => {
            this.neo4j.commit(transaction).then((resultSets: Array<ResultSet>) => {

                 // "r" dataset (relationship nodes) should match number of "b" nodes...)
                 // @todo ...what happens with multiple relationships then?
                let dataset = resultSets[0].getDataset('b')
                let dataset2 = resultSets[0].getDataset('r')

                let linkedNodes = []

                dataset2.forEach((rel: NodeInterface, i) => {
                    const targetNode = dataset[i]
                    linkedNodes.push(targetNode)
                })

                resolve(linkedNodes)

            }).catch(err => {
                throw new Error(err)
            })

        })

    }

    execute(queryString: string)
    {
        const transaction = new Transaction()
        transaction.add(queryString)

        return this.neo4j.commit(transaction)
    }
}
