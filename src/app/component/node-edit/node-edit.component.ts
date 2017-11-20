import { Component }                from '@angular/core';
import { OnInit, AfterViewInit }    from '@angular/core';
import { Input, Output }            from '@angular/core';
import { EventEmitter }             from '@angular/core';
import { CypherQuery }              from '../../neo4j';
import { Transaction }              from '../../neo4j';
import { Neo4jService, ResultSet }  from '../../neo4j';
import { Node, NodeInterface }      from '../../neo4j';

@Component({
    selector: 'node-edit',
    templateUrl: './node-edit.component.html',
    styleUrls: ['./node-edit.component.scss']
})
export class NodeEditComponent implements OnInit, AfterViewInit
{
    @Input('node') node: Node = null;
    @Output('onNodeEdited') onNodeEdited: EventEmitter<Node> = new EventEmitter()
    loading: boolean = false;

    constructor(private neo4j: Neo4jService)
    {

    }

    ngOnInit()
    {

    }

    ngAfterViewInit()
    {

    }

    save(e?: any)
    {
        if (e) { e.preventDefault() }
        this.loading = true

        const cypher = new CypherQuery()
        const transaction = new Transaction();

        cypher
            .matches('n')
            .andWhere('n', 'ID(?)', this.node.getId())
            .setProperties('n', this.node.properties())
            .returns('n, ID(n), LABELS(n)')
            .skip(0)
            .limit(1)


        const query = cypher.getQuery()
        transaction.add(cypher.getQuery())

        this.neo4j.commit(transaction).then((resultSets: Array<ResultSet>) => {

            const node = resultSets[0].getDataset('n').first()

            this.loading = false
            this.onNodeEdited.emit(node)

        }).catch(err => {
            this.loading = false
        })

    }

    cancel(e?: any)
    {
        if (e) { e.preventDefault() }
    }

    addProperty(e?: any)
    {
        if (e) { e.preventDefault() }
    }
}
