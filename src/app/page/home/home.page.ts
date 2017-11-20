import { Component, ViewChild }     from '@angular/core';
import { OnInit, AfterViewInit }    from '@angular/core';
import { GraphComponent }           from '../../component';
import { Node, NodeInterface  }     from '../../neo4j';
import { ResultSet, Transaction }   from '../../neo4j';
import { Neo4jService }             from '../../neo4j';
import { distinct }                 from '../../core/array/distinct';

@Component({
    selector: 'home-page',
    templateUrl: './home.page.html',
    styleUrls: ['./home.page.scss']
})
export class HomePageComponent implements OnInit, AfterViewInit
{
    currentSelectedNode: Node = null;
    createModeEnabled: boolean = false
    @ViewChild(GraphComponent) graph: GraphComponent;

    constructor(private neo4j: Neo4jService)
    {

    }

    ngOnInit()
    {

    }

    ngAfterViewInit()
    {
        this.graph.start()

        const transaction = new Transaction();
        transaction.add('MATCH (n: Ad), (b: Document) RETURN n, b, n.truc, ID(n), ID(b), LABELS(n), LABELS(b) LIMIT 20')

        this.neo4j.commit(transaction, Neo4jService.NO_DEBUG).then((resultSets: Array<ResultSet>) => {

            // the number of result sets depends on the number of transactions
            // const firstResultSet = resultSets[0]

            let dataset = resultSets[0].getDataset('n')
            dataset = distinct('ID', dataset)

            dataset.forEach((node: NodeInterface) => {
                this.graph.addNode(node)
            })

            this.graph.addNode(new Node({ ID: 3, LABELS: ['Person'], name: 'Yolo', x: 5, y: 6 }))

        }).catch(err => console.log(err) )
    }

    ngOnChanges()
    {

    }

    onSearch(e: any)
    {
        const query = e.query
        const mode = e.mode
    }

    onNodeSelected(node: NodeInterface)
    {
        this.currentSelectedNode = node
    }

    onNodeDoubleClicked(node: NodeInterface)
    {

    }

    onNodeAdded(node: NodeInterface)
    {

    }

    onNodeEdited(node: NodeInterface)
    {
        this.graph.updateNode(node)
    }

    onCreateModeChanged(e: boolean)
    {
        this.createModeEnabled = e
    }
}
