import { Component, ElementRef, OnChanges }     from '@angular/core';
import { Input, Output, EventEmitter }          from '@angular/core';
import { ViewChildren, QueryList, ContentChildren } from '@angular/core';
import { SimpleChanges }                        from '@angular/core';
import { SettingsService }                      from '../../service';
import { Neo4jRepository }                      from '../../neo4j';
import { ResultSet, CypherQuery, Transaction }  from '../../neo4j/orm';
import { Node, NodeInterface }                  from '../../neo4j/model';
import { diff }                                 from '../../core/array';

const randomPropNames = ['jumpy', 'flashbull', 'mourn', 'ugliest', 'furry', 'chew', 'equable', 'puzzling', 'oranges']

@Component({
    selector: 'node-edit',
    templateUrl: './node-edit.component.html',
    styleUrls: ['./node-edit.component.scss']
})
export class NodeEditComponent
{
    @Input('node') node: NodeInterface = null;
    @Output('onNodeEdited') onNodeEdited: EventEmitter<Node> = new EventEmitter()

    @ViewChildren('propNames', { read: ElementRef }) propNames: QueryList<ElementRef>;
    @ViewChildren('propValues', { read: ElementRef }) propValues: QueryList<ElementRef>;

    loading: boolean = false;
    cancelable: boolean = false;

    labelsDropdownVisible: boolean = false;

    selectedLabels: Array<string> = [];
    availableLabels: Array<string> = [];
    private originalLabels: Array<string> = [];
    private removedLabels: Array<string> = [];

    private properties: Array<[string, any]> = [];
    private originalProperties: Array<[string, any]> = [];
    private removedProperties : Array<[string, any]> = [];

    constructor(private settings: SettingsService, private repo: Neo4jRepository)
    {

    }

    toggleLabelsDropdown(e: any)
    {
        e.preventDefault()
    }

    private parseLabels()
    {
        this.availableLabels = this.settings.get('graph.labels');
        this.selectedLabels = this.node.getLabels();
    }

    ngOnChanges(changes: SimpleChanges)
    {
        if (null !== changes.node.currentValue) {
            // always copy node properties to properties for the view whenever its not null
            // also update all labels (available and node labels)
            this.properties = this.node.propertiesAsArray()

        } else {
            this.properties = [];
        }

        // detect when a node was changed (from null->node, node->node or null->node)
        if (this.gracefulId(changes.node.previousValue) !== this.gracefulId(changes.node.currentValue)) {
            // a new node was really selected, changes do not only concern current node

            if (null !== changes.node.currentValue) {
                // make a separate copy of the thing
                this.originalProperties = Object.assign([], this.properties);
                this.originalLabels = Object.assign([], this.node.getLabels());

                this.removedProperties = [];
                this.removedLabels = [];
            }
        }

        this.parseLabels()
    }

    onLabelsChanged(values: Array<string>)
    {
        this.cancelable = true;
    }

    onLabelRemoved(label: string)
    {
        // add value to the labels to remove if the node original
        // labels did contain this value
        if (this.originalLabels.indexOf(label) > -1) {
            this.removedLabels.push(label);
        }
    }

    onLabelAdded(label: string)
    {
        // there is no need to update this manually because
        // selected labels is already two-way bounded
    }

    save(e?: any)
    {
        if (e) { e.preventDefault() }

        this.loading = true;
        this.cancelable = false;

        const newProperties = this.gatherProperties()
        const removedProperties = this.gatherRemovedProperties()

        this.originalProperties = newProperties;

        this.repo.updateNodeById(this.node.getId(), newProperties, removedProperties, this.selectedLabels, this.removedLabels).then((resultSets: Array<ResultSet>) => {

            const node = resultSets[0].getDataset('n').first()
            this.onNodeEdited.emit(node)
            this.loading = false

        }).catch(err => {
            this.loading = false
            console.log(err)
            this.onNodeEdited.emit(null)
        })
    }

    addProperty(e: any)
    {
        e.preventDefault()
        this.cancelable = true

        const prop = randomPropNames[Math.floor(Math.random() * randomPropNames.length)]
        this.properties.push([prop, ''])
    }

    deleteProperty(e: any, index: number)
    {
        e.preventDefault()
        this.cancelable = true

        this.removedProperties.push(this.properties[index])
        this.properties.splice(index, 1)
    }

    cancel(e?: any)
    {
        if (e) { e.preventDefault() }

        this.cancelable = false;

        this.properties = Object.assign([], this.originalProperties)
        this.selectedLabels = Object.assign([], this.originalLabels)

    }

    private gatherProperties()
    {
        let props: any = {}
        const propsArray = this.propNames.toArray()
        const valuesArray = this.propValues.toArray()

        propsArray.forEach((ref: ElementRef, i) => {
            const prop = ref.nativeElement.value
            const value = valuesArray[i].nativeElement.value
            props[prop] = value
        })

        return props;
    }

    private gatherRemovedProperties()
    {
        let props: any = {}

        this.removedProperties.forEach((pair: [string, any]) => {
            const prop = pair[0]
            const value = pair[1]
            props[prop] = null
        })

        return props;
    }

    private gracefulId(node: NodeInterface)
    {
        return (node !== null && typeof(node) !== 'undefined' && node.getId() != null) ? node.getId() : null;
    }
}
