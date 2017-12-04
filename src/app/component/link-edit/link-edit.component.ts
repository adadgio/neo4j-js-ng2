import { Component, ElementRef }                from '@angular/core';
import { OnChanges, OnInit, AfterViewInit }     from '@angular/core';
import { HostListener  }                        from '@angular/core';
import { Input, Output, EventEmitter }          from '@angular/core';
import { ViewChildren, QueryList, }             from '@angular/core';
import { SimpleChanges }                        from '@angular/core';
import { SettingsService }                      from '../../service';
import { Neo4jRepository }                      from '../../neo4j';
import { ResultSet, CypherQuery, Transaction }  from '../../neo4j/orm';
import { Node, NodeInterface }                  from '../../neo4j/model';
import { diff }                                 from '../../core/array';

const randomPropNames = ['jumpy', 'flashbull', 'mourn', 'ugliest', 'furry', 'chew', 'equable', 'puzzling', 'oranges']

export type LinkUpdatedEvent = {
    currentValue: NodeInterface;
    previousValue: NodeInterface;
}

@Component({
    selector: 'link-edit',
    templateUrl: './link-edit.component.html',
    styleUrls: ['./link-edit.component.scss']
})
export class LinkEditComponent implements OnInit, AfterViewInit, OnChanges
{
    @Input('link') link: NodeInterface = null;
    @Output('onLinkEdited') onLinkEdited: EventEmitter<any> = new EventEmitter();

    @ViewChildren('propNames', { read: ElementRef }) propNames: QueryList<ElementRef>;
    @ViewChildren('propValues', { read: ElementRef }) propValues: QueryList<ElementRef>;

    loading: boolean = false;
    cancelable: boolean = false;

    originalLink: any;
    originalType: string|String = null;
    originalProperties: Array<any> = [];
    removedProperties: Array<any> = [];

    type: string|String = null;
    properties: Array<any> = []

    constructor(private settings: SettingsService, private repo: Neo4jRepository)
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
        if (null === changes.link.currentValue) {
            this.type = null;
            this.properties = [];

        }

        // detect when a node was changed (from null->node, node->node or null->node)
        if (this.gracefulId(changes.link.previousValue) !== this.gracefulId(changes.link.currentValue)) {

            // a new node was really selected
            if (null !== changes.link.currentValue) {

                this.assignValue(this.link)
                this.cancelable = false;
            }
        }
    }

    assignValue(link: Node)
    {
        this.originalLink = Object.assign({}, link)
        this.originalType = link.getType()
        Object.assign(this.originalProperties, link.propertiesAsArray())

        this.link = link;
        this.type = this.link.getType()
        this.properties = this.link.propertiesAsArray()
    }

    onTypeKeyup(e: any)
    {
        this.cancelable = true;
    }

    save(e?: any)
    {
        if (e) { e.preventDefault() }
        this.loading = true;
        this.cancelable = false;

        // if link type must be changed...
        let changedType = null;
        if (this.type !== this.originalType) {
            changedType = this.type;
        }

        const newProperties = this.gatherProperties();
        const removedProperties = this.gatherRemovedProperties();

        this.originalProperties = newProperties;

        this.repo.updateRelationshipById(this.link.getId(), this.originalType, changedType, newProperties, removedProperties).then((resultSets: Array<ResultSet>) => {

            const link = resultSets[0].getDataset('r').first()
            
            // update current link
            this.loading = false;
            this.onLinkEdited.emit({ currentValue: link, previousValue: this.link })
            this.assignValue(link)

        }).catch(err => {
            this.loading = false
            // @todo An error to show?
            console.log(err)
        })
    }

    addProperty(e: any)
    {
        e.preventDefault();
        this.cancelable = true;

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

    cancel(e: any)
    {
        e.preventDefault();
        this.cancelable = false;

        this.type = this.originalType;
        this.properties = Object.assign([], this.originalProperties)
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
