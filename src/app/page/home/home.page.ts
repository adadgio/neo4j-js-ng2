import { Component, ViewChild }     from '@angular/core';
import { OnInit, AfterViewInit }    from '@angular/core';
import { GraphComponent }           from '../../component';
import { SettingsService }          from '../../service';
import { Neo4jService }             from '../../neo4j';
import { Neo4jRepository }          from '../../neo4j';
import { ResultSet, Transaction }   from '../../neo4j/orm';
import { Node, NodeInterface  }     from '../../neo4j/model';
import { distinct, crosscut }       from '../../core/array';

@Component({
    selector: 'home-page',
    templateUrl: './home.page.html',
    styleUrls: ['./home.page.scss'],
    host: { '(window:keydown)': 'onHotkeyPressed($event)' },
})
export class HomePageComponent implements OnInit, AfterViewInit
{
    selectedNode: Node = null;
    createModeEnabled: boolean = false
    createModeDefaults: any = {
        label: 'Test'
    }
    @ViewChild(GraphComponent) graph: GraphComponent;

    constructor(private neo4j: Neo4jService, private repo: Neo4jRepository, private settings: SettingsService)
    {

    }

    ngOnInit()
    {

    }

    ngAfterViewInit()
    {
        this.graph.start()

        const transaction = new Transaction()
        transaction.add('MATCH (n: Company), (b: Officer) RETURN n, b, n.truc, ID(n), ID(b), LABELS(n), LABELS(b) LIMIT 200')

        this.neo4j.commit(transaction).then((resultSets: Array<ResultSet>) => {

            // the number of result sets depends on the number of transactions
            // const firstResultSet = resultSets[0]
            let dataset = resultSets[0].getDataset('n')
            // dataset = distinct('ID', dataset)

            dataset.forEach((node: NodeInterface) => {
                this.graph.addNode(node)
            })

            // const newNode = new Node({ 'ID': 3, 'LABELS': ['Person'] })
            // newNode.setFixed(true)
            // this.graph.addNode(newNode)

        }).catch(err => console.log(err) )
    }

    ngOnChanges()
    {

    }

    onHotkeyPressed(e: any)
    {
        // handle IE, and then Netscape/Firefox/Opera
        const keynum = (window.event) ? e.keyCode : e.which

        const letter = String.fromCharCode(keynum);
        const ctrlKey = (true === e.ctrlKey) ? 'ctrl' : false
        const inputCombination = [letter, ctrlKey]

        const createModeCombination = this.settings.get('hotkeys.toggleCreateMode')

        if (crosscut(inputCombination, createModeCombination)) {
            this.onCreateModeChanged(!this.createModeEnabled)
        }
    }

    onSearch(e: any)
    {
        const query = e.query
        const mode = e.mode

        console.log(e)
    }

    onNodeCreated(node: NodeInterface)
    {
        // a new node object is createee but not yet appended to the graph
        // and not saved remotely. This is because we are using real neo4j IDs
        // to handle proper UI and be safe regarding integrity so you'll
        // need to make the cypher transaction and append node to graph only
        // if it was successfull
        const savedNode = node;

        // @todo Set default label from create mode windows
        node.addLabel(this.createModeDefaults.label)

        this.repo.persistNode(node).then((node: NodeInterface) => {
            node.setFixed(true).setCoords(savedNode.getCoords())
            this.graph.addNode(node)
        })
    }

    onNodeSelected(node: NodeInterface)
    {
        this.selectedNode = node
    }

    onNodeDoubleClicked(node: NodeInterface)
    {
        this.findRelationships(node)
    }

    onNodeAdded(node: NodeInterface)
    {
        // very unlikely you will use this event but who knows...
        // this is triggered when a node is added to the graph (not created per say)
    }

    onNodeEdited(node: NodeInterface)
    {
        console.log(node)
        this.graph.updateNode(node)
    }

    onRlationshipCreate(e: any)
    {
        console.log(e)
    }

    onCreateModeChanged(e: boolean)
    {
         // avoid expression (of createModeEnabled) before it was checked (just Angular2 classic view adjustement here)
        this.selectedNode = null;
        // then safely reset create mode variable
        this.createModeEnabled = e;
    }

    private findRelationships(sourceNode: NodeInterface)
    {
        this.repo.findRelationshipsById(sourceNode.getId()).then((linkedNodes: Array<NodeInterface>) => {

            linkedNodes.forEach((targetNode, i) => {
                this.graph.addNode(targetNode)
                this.graph.addLink(sourceNode, targetNode)
            })

        }).catch(err => {
            console.log(err)
        })
    }
}
