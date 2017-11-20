import { NgZone, Component }                    from '@angular/core';
import { OnChanges, OnInit, AfterViewInit }     from '@angular/core';
import { Input, Output, EventEmitter }          from '@angular/core';
import { SimpleChanges }                        from '@angular/core';
import { Neo4jRepository }                      from '../../neo4j';
import { ResultSet, CypherQuery, Transaction }  from '../../neo4j/orm';
import { Node, NodeInterface }                  from '../../neo4j/model';

const randomPropNames = ['jumpy', 'flashbull', 'mourn', 'ugliest', 'furry', 'chew', 'equable', 'puzzling', 'oranges']

@Component({
    selector: 'node-edit',
    templateUrl: './node-edit.component.html',
    styleUrls: ['./node-edit.component.scss']
})
export class NodeEditComponent implements OnInit, AfterViewInit, OnChanges
{
    @Input('node') node: NodeInterface = null;
    @Output('onNodeEdited') onNodeEdited: EventEmitter<Node> = new EventEmitter()

    loading: boolean = false;
    cancelable: boolean = false;

    private originalProps: any = null; // NodeInterface = null;

    constructor(private repo: Neo4jRepository, private zone: NgZone)
    {

    }

    ngOnInit()
    {

    }

    ngAfterViewInit()
    {

    }

    ngOnChanges(changes: SimpleChanges)
    {
        // detect when a node was changed (from null->node, node->node or null->node)
        if (this.gracefulId(changes.node.previousValue) !== this.gracefulId(changes.node.currentValue)) {
            // a new node was really selected, changes do not only concern current node

            if (null !== changes.node.currentValue) {
                let copy = Object.assign({}, changes.node.currentValue.properties());
                this.originalProps = copy
            }
        }
    }

    save(e?: any)
    {
        if (e) { e.preventDefault() }

        this.loading = true
        this.originalProps = this.node.properties()

        this.repo.updateNodeById(this.node.getId(), this.node.properties()).then((resultSets: Array<ResultSet>) => {

            const node = resultSets[0].getDataset('n').first()
            this.onNodeEdited.emit(node)
            this.loading = false

        }).catch(err => {
            this.loading = false
        })
    }

    addProperty(e: any)
    {
        e.preventDefault()
        this.cancelable = true
        
        const prop = randomPropNames[Math.floor(Math.random() * randomPropNames.length)];
        this.node.add(prop, '...')
    }

    deleteProperty(e: any, prop: string)
    {
        e.preventDefault()
        this.cancelable = true
        this.node.remove(prop)
    }

    cancel(e?: any)
    {
        if (e) { e.preventDefault() }

        this.cancelable = false
        this.node.reset(this.originalProps)
    }

    private gracefulId(node: NodeInterface)
    {
        return (node !== null && typeof(node) !== 'undefined' && node.getId() != null) ? node.getId() : null
    }
}
