import { Component, ViewChild }     from '@angular/core';
import { OnInit, AfterViewInit }    from '@angular/core';
import { GraphComponent }           from '../../component';
import { SettingsService }          from '../../service';
import { Neo4jService }             from '../../neo4j';
import { Neo4jRepository }          from '../../neo4j';
import { ResultSet, Transaction }   from '../../neo4j/orm';
import { Node, NodeInterface  }     from '../../neo4j/model';
import { crosscut }                 from '../../core/array';

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

    // @todo General: sue a setting to discint nodes by propertu (ID) or none, and use distinct INSIDE graph.componenet
    constructor(private neo4j: Neo4jService, private repo: Neo4jRepository, private settings: SettingsService)
    {

    }

    ngOnInit()
    {

    }

    ngAfterViewChecked()
    {

    }

    ngAfterViewInit()
    {
        this.graph.start()
        // this.onSearch({ queryString: 'MATCH (n:Officer) RETURN n LIMIT 5'})
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
        // const mode = e.mode;
        // const queryString = e.queryString;

        this.repo.execute(e.queryString).then((resultSets: Array<ResultSet>) => {

            let links = [];
            let dataset1 = resultSets[0].getDataset('a')
            let dataset2 = resultSets[0].getDataset('r')
            let dataset3 = resultSets[0].getDataset('b')

            dataset2.forEach((rel: NodeInterface, i) => {
               links.push({ source: dataset3[i], target: dataset1[i], relationship: dataset2[i] });
            })

            this.graph.addNodes(dataset1)
            this.graph.addNodes(dataset3)
            this.graph.addLinks(links)
            this.graph.update()

        }).catch(err => {
            console.log(err)
        })
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

    onLinkSelected(g: any)
    {
        console.log('Link selected', g)
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
        this.repo.findRelationships(sourceNode).then((links: Array<NodeInterface>) => {

            links.forEach((result, i) => {
                this.graph.addNode(result.target)
                this.graph.addLink(result.source, result.target, result.relationship)
            })

        }).catch(err => {
            console.log(err)
        })
    }
}
