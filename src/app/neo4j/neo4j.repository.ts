import { Injectable }               from '@angular/core';
import { Neo4jService }             from './neo4j.service';
import { ResultSet, Transaction }   from '../neo4j/orm';
import { CypherQuery, SimpleQuery } from '../neo4j/orm';
import { Node, NodeInterface }      from '../neo4j/model';
import { Link, LinkInterface }      from '../neo4j/model';
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
                resolve(node)

            }).catch(err => {
                throw new Error(err)
            })
        })
    }

    updateNodeById(id: number, changedProperties: any, removedProperties: any, labels: Array<string> = null, removedLabels: Array<string> = null): Promise<Array<ResultSet>>
    {
        const builder = new CypherQuery()

        // build a query string to pass to a transaction
        const query = builder
            .matches('n')
            .andWhere('n', 'ID(?)', id)
            .setLabels('n', labels)
            .removeLabels('n', removedLabels)
            .setProperties('n', changedProperties)
            .removeProperties('n', removedProperties)
            .returns('n, ID(n), LABELS(n)')
            .skip(0)
            .limit(1)
            .getQuery();

        const transaction = new Transaction()
        transaction.add(query)

        return this.neo4j.commit(transaction)
    }

    findRelationships(node: NodeInterface)
    {
        const transaction = new Transaction()
        transaction.add(`MATCH (a)-[r]-(b) WHERE ID(a) = ${node.getId()} RETURN a, b, ID(a), ID(b), LABELS(a), LABELS(b), r, ID(r), TYPE(r)`)

        return new Promise((resolve, reject) => {
            this.neo4j.commit(transaction).then((resultSets: Array<ResultSet>) => {

                 // "r" dataset (relationship nodes) should match number of "b" nodes...)
                 // @todo ...what happens with multiple relationships then?
                let dataset1 = resultSets[0].getDataset('a')
                let dataset2 = resultSets[0].getDataset('r')
                let dataset3 = resultSets[0].getDataset('b')

                let links = [];

                dataset2.forEach((rel: NodeInterface, i) => {
                    const targetNode = dataset3[i];
                    links.push(new Link({ source: node, target: dataset3[i], relationship: dataset2[i] }))
                })

                resolve(links)

            }).catch(err => {
                throw new Error(err)
            })

        })

    }


    updateRelationshipById(id: number, type: string|String, changedType: string|String = null, changedProperties: any, removedProperties: any)
    {
        const transaction01 = new Transaction()

        // make a cypher query to update relationship type
        if (null != changedType) {

            transaction01.add(`MATCH (a)-[r1:${type}]->(b) WHERE ID(r1) = ${id} CREATE (a)-[r:${changedType}]->(b) SET r = r1
                WITH r1, r DELETE r1 RETURN r, TYPE(r), ID(r)`)

        } else if (type != null) {
            transaction01.add(`MATCH (a)-[r:${type}]->(b) WHERE ID(r) = ${id} RETURN r, TYPE(r), ID(r)`)

        } else {
            transaction01.add(`MATCH (a)-[r]->(b) WHERE ID(r) = ${id} RETURN r, TYPE(r), ID(r)`)
        }

        return new Promise((resolve, reject) => {
            this.neo4j.commit(transaction01).then((resultSets: Array<ResultSet>) => {

                let dataset: Node = resultSets[0].getDataset('r').first()
                resolve(dataset)

            }).catch(err => {
                reject(err)
            })
        }).then((link: Node) => {
            const transaction = new Transaction()
            const builder = new CypherQuery()

            builder
                .matches(`MATCH (n)-[r:${link.getType()}]-(b)`, CypherQuery.RAW_QUERY_PART)
                .andWhere('r', 'ID(?)', link.getId())
                .setProperties('r', changedProperties)
                .removeProperties('r', removedProperties)
                .returns('r, ID(r), TYPE(r)')

            let query = builder.getQuery()
            transaction.add(query)

            return this.neo4j.commit(transaction);
        })
    }

    execute(queryString: string)
    {
        const transaction = new Transaction()
        transaction.add(queryString)

        return this.neo4j.commit(transaction)
    }
}
