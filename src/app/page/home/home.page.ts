import { Component }                from '@angular/core';
import { OnInit, AfterViewInit }    from '@angular/core';
import { Graph }                    from '../../component';
import { Node, ResultSet }          from '../../neo4j';
import { Transaction }              from '../../neo4j';
import { Neo4jService }             from '../../neo4j';

@Component({
    selector: 'home-page',
    templateUrl: './home.page.html',
    styleUrls: ['./home.page.scss']
})
export class HomePageComponent implements OnInit, AfterViewInit
{
    graph: Graph;
    selectedNode: any = Node;

    constructor(private neo4j: Neo4jService)
    {
        const transaction = new Transaction();
        transaction.add('MATCH (n: Ad), (b: Document) RETURN n, b, n.truc, ID(n), ID(b), LABELS(n), LABELS(b) LIMIT 3')
        // transaction.add('MATCH (a: Ad) RETURN a LIMIT 3')
        // transaction.add('MATCH (b: Ad) RETURN b.id, b.name LIMIT 5')

        this.neo4j.commit(transaction).then((resultSets: Array<ResultSet>) => {

            // the number of result sets depends on the number of transactions
            // const firstResultSet = resultSets[0]

            const dataset = resultSets[0].getDataset('n')

            //.distinct('id')
            dataset.distinct('id').each((n: Node) => {
                console.log(n)
            })

        }).catch(err => console.log(err) )
    }

    ngOnInit()
    {
        this.graph = new Graph('#graph')
        this.graph.addNode(new Node({ id: 4, name: 'test' }))
        this.graph.addNode(new Node({ id: 3, name: 'test' }))
    }

    ngAfterViewInit()
    {

    }
}
