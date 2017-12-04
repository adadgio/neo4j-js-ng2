declare var window: any;
import * as d3 from 'd3';
import { environment } from '../../../environments/environment';

import { Input, Output, Component }                 from '@angular/core';
import { OnInit, OnChanges, AfterViewInit }         from '@angular/core';
import { ElementRef, HostBinding, EventEmitter }    from '@angular/core';
import { SettingsService }                          from '../../service';
import { Node, NodeInterface }                      from '../../neo4j/model';
import { Link, LinkInterface }                      from '../../neo4j/model';
import { Finder, Mouse, State, Shape }              from './graph-utils';
import { distance }                                 from './graph-utils';
import { distinct, crosscut }                       from '../../core/array';

@Component({
    selector: 'graph-component',
    styleUrls: ['./graph.component.scss'],
    template: `<svg id="graph"></svg>`,
    providers: [],
})
export class GraphComponent implements OnInit, AfterViewInit, OnChanges
{
    private DONT_UPDATE: boolean = false;
    @Input('width') width: number;
    @Input('height') height: number;

    private selector: string = 'svg#graph';

    private svg: any;
    private force: any;

    private nodes: Array<any> = []; // force.nodes()
    private links: Array<any> = [];
    private nodesRef: any;
    private linksRef: any;

    private primaryKey: string = 'none';

    @Output('nodeAdded') nodeAdded: EventEmitter<Node> = new EventEmitter()
    @Output('nodeCreated') nodeCreated: EventEmitter<Node> = new EventEmitter()
    @Output('nodeSelected') nodeSelected: EventEmitter<Node> = new EventEmitter()
    @Output('linkSelected') linkSelected: EventEmitter<Node> = new EventEmitter()
    @Output('nodeDoubleClicked') nodeDoubleClicked: EventEmitter<Node> = new EventEmitter()
    @Output('relationshipCreate') relationshipCreate: EventEmitter<any> = new EventEmitter()

    @Input('createMode') set createMode(mode: boolean) {
        this.toggleCreateMode(mode)
    }

    // @Output('createModeChanged') createModeChanged: EventEmitter<boolean> = new EventEmitter();

    constructor(private elementRef: ElementRef, private settings: SettingsService)
    {
        // define primary keys for links and nodes
        this.primaryKey = this.settings.get('graph.nodes.primaryKey');
    }

    ngOnInit()
    {

    }

    ngAfterViewInit()
    {
        this.calculateWidthAndHeight()
    }

    ngOnChanges()
    {

    }

    start()
    {
        d3.select(window)
            .on('keyup', (e) => {

            })
            .on('keydown', (e) => {

            })

        this.svg = d3.select(this.selector)
            .on('click', (e)=> {
                if (d3.event.target.tagName === 'svg') {
                    // deselect all link groups and node groups
                    this.unselectNodes()
                    this.unselectLinks()
                    this.nodeSelected.emit(null)
                    this.linkSelected.emit(null)
                }
            })
            .on('mouseup', (e) => {
                this.graphOnMouseUp()

                if (null !== State.dragline && State.dragline.isBeeingDragged()) {
                    this.graphOnRelationshipDragEnd()
                }
            })
            .on('mouseout', (e) => {
                // hide cursor
                if (null !== State.cursor) {
                    State.cursor.hide()
                }
                // nooooo ! prevent any dragline form working!!
                // if (null !== State.dragline) {
                //     this.graphOnRelationshipDragFinished()
                // }
            })
            .on('mouseover', (e) => {
                // re-show cursor if applicable
                if (null !== State.cursor) {
                    State.cursor.show()
                }
            })
            .on('mousedown', (e) => {
                this.graphOnMouseDown()
            })
            .on('mousemove', (e) => {
                const coords = Mouse.getCoords(d3.event.currentTarget)

                // State.dragPos = coords

                // let the cursor follow the mouse if it exist
                if (null !== State.cursor) {
                    State.cursor.attr('transform', `translate(${coords})`)
                }

                // let dragline follow mouse position on drag and
                if (null !== State.dragline && State.dragline.isBeeingDragged()) {
                    // needs to be called inside a "mouse event" such as here
                    State.dragline.followMousePointer(d3.event)
                    State.cursor.classed('hidden', true)

                }

                // if (null !== State.cursor && null !== State.dragline && !State.dragline.isBeeingDragged()) {
                //     State.cursor.classed('hidden', false)
                // }

            })

        this.force = d3.layout.force()
            .nodes([]).links([])
            .charge(-130).linkDistance(120).size([this.width, this.height])
            .on('tick', (e) => {
                this.onTick(this.nodesRef, this.linksRef)
            });

        this.nodes = this.force.nodes()
        this.links = this.force.links()
        this.nodesRef = this.svg.selectAll('circle.node')
        this.linksRef = this.svg.selectAll('line.link')

        // attach drag event handlers
        this.force
            .drag()
            // .origin(function(d) { return {x: d.x, y: d.y}; })
            .on('dragstart', (d) => {
                if (false === State.dragEnabled) {
                    return
                }

                // save mouse position when drag starts
                // because dragPos is always updated on mouse move the following is safe
                // State.dragStartPos = State.dragPos
                // State.currentlyDragging = true

            }).on('drag', (d) => {
                // id currently dragging and in create mode, prevent
                // new nodes to be added when mouse event id down/up
            }).on('dragend', (d) => {
                // reset the dragged element (no element is beeing dragged)

                // save mouse position when drag ends
                // because dragPos is always updated on mouse move the following is safe
                // State.dragStartPos = State.dragPos

                // fix current node
                if (true === State.dragEnabled) {
                    d3.select(d3.event.currentTarget).classed('fixed', d.fixed = true)
                }

                // State.currentlyDragging = false
            });

        // attach current svg object to the shape creator
        Shape.attach(this.svg)
    }

    update()
    {
        // apply general update pattern to the nodes
        this.nodesRef = this.nodesRef.data(this.nodes, (d) => { return d[this.primaryKey] })
        this.linksRef = this.linksRef.data(this.links, (d) => { return d.relationship[this.primaryKey] })

        // first append a group in which to fit the colored
        // circle the node text label and the outer ring
        // all events are attached to the group and whats inside is just nice design
        let nodeGroupsRefs = this.nodesRef
            .enter().append('g')
            // .attr("transform", "translate(100,100)")
            .attr('class', 'node-group')
            .on('contextmenu', (d, i) => {
                // prevent context menu default on mouse right
                // click to use it to different means. We attach that to
                // node groups only because we want normal behavior on all
                // other html elements including document and body
                // for debugging and inspection freedom. This is not Donald Trump's country
                d3.event.stopPropagation()
                d3.event.preventDefault()
            })
            .on('mouseout', (n: NodeInterface) => {
                if (State.createModeEnabled) {
                    State.cursor.show()
                }

                if (true === State.createModeEnabled) {
                    d3.select(d3.event.currentTarget).select('.node').transition().duration(150).attr('transform', 'scale(1)')
                }
            })
            .on('mouseover', (n: NodeInterface) => {

                if (State.createModeEnabled) {
                    State.cursor.hide()
                }

                if (true === State.createModeEnabled && null !== State.dragline && State.dragline.isBeeingDragged()) {
                    // enlarge target node
                    // cause bugs and glitches so find another way to do this
                    d3.select(d3.event.currentTarget).select('.node').transition().duration(150).attr('transform', 'scale(1.2)')
                }

                d3.event.stopPropagation()
            })
            .on('mousedown', (n: NodeInterface) => {
                // this is the node group beeing dragged
                const target = d3.event.currentTarget;
                // current target is the target the event is attached to (here node group)
                // while target is the actual clicked/mouse up element. Here we definately want the current target!
                const element = d3.select(d3.event.currentTarget)

                // skip if this is not the left button
                if (d3.event.button !== 0) {
                    return
                }

                // when create mode is on skip this event
                if (true === State.createModeEnabled) {
                    d3.event.stopPropagation()
                    return
                }

                // change cursor on group when create mode is disabled
                // because dragging nodes is allowed
                element.classed('beeing-dragged', true)

                // save current mouse position when mouse is down
                // because it will be used when the mouse up event is triggered
                // to find a mouse positions distance and detect a drag gesture from click or double click
                Mouse.coords = Mouse.getCoords()

            })
            .on('mouseup', (n: NodeInterface) => {
                // this is the node group beeing dragged
                const target = d3.event.currentTarget;
                // current target is the target the event is attached to (here node group)
                // while target is the actual clicked/mouse up element. Here we definately want the current target!
                const element = d3.select(d3.event.currentTarget)

                // always remove grabbing hand cursor when mouse is up
                element.classed('beeing-dragged', false)

                // skip if this is not the left button
                // if (d3.event.button !== 0) {
                //     return
                // }
                if (d3.event.button === 2) {
                    console.log('unfix me but it does not work')
                    // release fixed node
                    // n.fixed = false
                    // element.fixed = false
                    // element.classed('fixed', n.fixed = false)
                    // return
                }

                // prevent drag by default (assume its a click or a double click by default)
                State.dragEnabled = false

                // when create mode is on skip this event
                // and prevent any simple/double click events
                if (true === State.createModeEnabled) {
                    return
                }

                // when the distance between mousedown coordinates and
                // mouse up coordinates is higher than the tolerance setting
                // we can assume this is a drag gesture and thus allow drag
                // and we can prevent drag...
                if (distance(Mouse.coords, Mouse.getCoords()) > Mouse.clickTolerance) {
                    State.dragEnabled = true
                    return
                }

                // ...else assume its the "end" of a click or double click event
                // and make a smart difference between simple and double clicks
                if (null !== Mouse.dblClickTimeout) {
                    // double click detected
                    clearTimeout(Mouse.dblClickTimeout)
                    this.nodeDoubleClicked.emit(n)
                    Mouse.dblClickTimeout = null

                } else {

                    Mouse.dblClickTimeout = setTimeout(() => {
                        // simple click detected
                        this.selectNode(element)
                        this.nodeSelected.emit(n)
                        Mouse.dblClickTimeout = null
                    }, 205)
                }
            })
            // .classed('draggable', true)
            .call(this.force.drag)

        // add ui elements to group and apply general remove pattern to nodes
        Shape.appendNodeGroupShapes(nodeGroupsRefs, this.settings)
        this.nodesRef.exit().remove()

        let linksGroupsRef = this.linksRef
            .enter().append('g')
            .attr('class', 'link-group')
            .on('click', (g) => {
                // "g" contains source, target and relationship
                const element = d3.select(d3.event.currentTarget)
                this.selectLink(element)
                this.linkSelected.emit(g)
            })

        // add ui elements to group and apply general remove pattern to links
        Shape.appendShapesToLinkGroups(linksGroupsRef, this.settings)
        this.linksRef.exit().remove()

        this.force.start();
    }

    /**
     * Add a single node.
     *
     * @param node NodeInterface
     * @param update boolean
     */
    addNode(node: NodeInterface, update: boolean = true)
    {
        if (this.exists(node)) { return }

        this.nodes.push(node)
        if (true === update) { this.update() }
        this.nodeAdded.emit(node)
    }

    /**
     * Add multiple nodes.
     *
     * @param nodes Array<NodeInterface>
     */
    addNodes(nodes: Array<NodeInterface>)
    {
        for (let i in nodes) {
            this.addNode(nodes[i], this.DONT_UPDATE)
        }
    }

    /**
     * Add single link.
     *
     * @param link LinkType such as { source: NodeInterface, target: NodeInterface, relationship: NodeInterface }
     * @param update boolean Update the graph wiith d3js
     */
    addLink(link: LinkInterface, update: boolean = true)
    {
        let source = Finder.in(this.nodes).findById(link.source.getId())
        let target = Finder.findById(link.target.getId())

        this.links.push({
            source: source,
            target: target,
            relationship: link.relationship,
        });

        if (true === update) {
            this.update();
        }
    }

    /**
     * Add multiple links.
     *
     * @param links Array<LinkType>
     * @param update boolean Update the graph wiith d3js
     */
    addLinks(links: Array<LinkInterface>)
    {
        for (let i in links) {
            this.addLink(links[i], this.DONT_UPDATE)
        }
    }

    /**
     * Update a node on the graph.
     *
     * @param node NodeInterface
     */
    updateNode(node: NodeInterface)
    {
        const index: number = Finder.in(this.nodes).findIndexById(node.getId())
        const prevNode: Node = Finder.findById(node.getId());

        if (null === index) { return }

        // keep node x and y position !
        State.savedNode = { x: prevNode.x, y: prevNode.y }

        this.removeNodeByIndex(index) //  this.DONT_UPDATE

        // set prev coordinates to avoid glitch effect
        node.setCoords([prevNode.x, prevNode.y]);

        this.nodes.push(node)
        this.update()
    }

    updateLink(relationship: NodeInterface, previousValue: NodeInterface, update: boolean = true)
    {
        const index: number = Finder.in(this.links).findIndexById(previousValue.getId())
        const link: Link = Finder.in(this.links).findById(previousValue.getId())

        const sourceNode = link.source;
        const targetNode = link.target;

        this.removeLinkById(previousValue.getId(), this.DONT_UPDATE)

        this.links.push(new Link({ source: sourceNode, target: targetNode, relationship: relationship }))
        this.update()
    }

    exists(node: NodeInterface)
    {
        for (let i in this.nodes) {
            if (this.nodes[i][this.primaryKey] === node[this.primaryKey]) {
                return true;
            }
        }

        return false;
    }

    removeNode(node: NodeInterface, update: boolean = true)
    {
        const index = Finder.in(this.nodes).findIndexById(node.getId())
        this.removeNodeByIndex(index, update)
    }

    removeNodeByIndex(index: number, update: boolean = true)
    {
        this.nodes.splice(index, 1)

        if (true === update) {
            this.update()
        }
    }

    removeLinkById(id: number, update: boolean = true)
    {
        const index = Finder.in(this.links).indexOf(id)
        this.links.splice(index, 1)

        if (true === update) {
            this.update()
        }
    }

    removeLinkByIndex(index: number,  update: boolean = true)
    {
        this.links.splice(index, 1)

        if (true === update) {
            this.update()
        }
    }

    onTick(nodes: any, links: any)
    {
        nodes.attr('transform', function (d) {
            // let x = Math.max(30, Math.min(this.width - 30, d.x))
            // let y = Math.max(30, Math.min(this.height - 30, d.y))
            // just avoid infinite loop on user corrupted queries...
            if (typeof(d.x) === 'undefined' || d.x == null) {
                throw Error(`graph.component.ts Infinite loop detected`)
            }

            return `translate(${[d.x, d.y]})`
        })

        links.selectAll('.link,.link-overlay')
            .attr('x1', function(d) {
                var angle = Math.atan2(d.target.y - d.source.y, d.target.x - d.source.x);
                return d.source.x + Math.cos(angle) * (20);
            })
            .attr('y1', function(d) {
                var angle = Math.atan2(d.target.y - d.source.y, d.target.x - d.source.x);
                return d.source.y + Math.sin(angle) * (20);
            })
            .attr('x2', function(d) {
                var angle = Math.atan2(d.target.y - d.source.y, d.target.x - d.source.x);
                return d.target.x - Math.cos(angle) * (20 + 4);
            })
            .attr('y2', function(d) {
                var angle = Math.atan2(d.target.y - d.source.y, d.target.x - d.source.x);
                return d.target.y - Math.sin(angle) * (20 + 4);
            })

        links.selectAll('.link-text')
            .attr('transform', function(d) {
                // console.log(g, e, i)
                // calcul de l'angle du label
                var angle = Math.atan((d.source.y - d.target.y) / (d.source.x - d.target.x)) * 180 / Math.PI;
                return 'translate(' + [((d.source.x + d.target.x) / 2), ((d.source.y + d.target.y) / 2)] + ')rotate(' + angle + ')';
            });
    }

    selectNode(element: any)
    {
        // select all node groups and unselect them
        this.unselectNodes()
        element.classed('selected', true)
    }

    unselectNodes()
    {
        this.svg.selectAll('.node-group').classed('selected', false)
    }

    selectLink(element: any)
    {
        this.unselectLinks()
        element.classed('selected', true)
    }

    unselectLinks()
    {
        this.svg.selectAll('.link-group').classed('selected', false)
    }

    enableCreateMode()
    {
        State.createModeEnabled = true
        d3.selectAll('g.node-group').classed('droppable', true)

        // create a hidden drag line to allow linking two nodes
        State.cursor = Shape.createCursor()
        // dont create dragline here, see graph on rel. drag start method

        this.unselectNodes()
        this.nodeSelected.emit(null)

        // this.createModeChanged.emit(State.createModeEnabled)
        this.disableDragging()
    }

    disableCreateMode()
    {
        State.createModeEnabled = false
        d3.selectAll('g.node-group').classed('droppable', false)

        if (null !== State.cursor) {
            State.cursor.remove()
            State.cursor = null
        }

        this.enableDragging()
    }

    toggleCreateMode(mode: boolean)
    {
        if (false === mode) {
            this.disableCreateMode()
        } else {
            this.enableCreateMode()
        }
    }

    enableDragging()
    {
        State.dragEnabled = true
        const groups = d3.selectAll('g.node-group')

        if (groups.size() === 0) {
            return
        }

        groups
            .on('touchstart.drag', State.savedHandlers.touchStartDrag)
            .on('mousedown.drag', State.savedHandlers.mouseDownDrag)
            .call(this.force.drag)
    }

    disableDragging()
    {
        State.dragEnabled = false
        const groups = d3.selectAll('g.node-group')

        // save current event handlers in memory to attach
        // hem again later when drag needs to be enabled again
        // and set new empty functions handlers to the events
        if (groups.size() > 0) {
            State.savedHandlers.touchStartDrag = groups.on('touchstart.drag')
            State.savedHandlers.mouseDownDrag = groups.on('mousedown.drag')
        }

        // groups
        //     .on('touchstart.drag', State.savedHandlers.touchStartDrag)
        //     .on('mousedown.drag', State.savedHandlers.mouseDownDrag)
        //     .call(this.force.drag)

        groups
            .on('touchstart.drag', function (e) {
                // nothing to do here
            })
            .on('mousedown.drag', (n: NodeInterface) => {
                const e = d3.event
                e.stopPropagation()
                this.graphOnRelationshipDragStart(n)
            })
    }

    graphOnMouseUp()
    {
        if (false === State.createModeEnabled) {
            return
        }

        clearInterval(State.pushMouseTimer)
        State.cursor.resetStyle()
    }

    graphOnMouseDown()
    {
        if (false === State.createModeEnabled) {
            return
        }

        const coords = Mouse.getCoords(d3.event.currentTarget)

        let clock = 0
        let canCreate: boolean = true
        // start css transition effect on the cursor
        State.cursor.animate()

        // start a timer while animateing cursor and let node be created when the timer ends
        State.pushMouseTimer = setInterval(() => {
            if (false === canCreate) {
                clock = 0
                State.cursor.resetStyle()
                clearInterval(State.pushMouseTimer)
            }

            if (clock >= State.pushMouseTimerTolerance) {

                clock = 0

                State.cursor.resetStyle()
                clearInterval(State.pushMouseTimer)

                // create a node for the graph
                const newNode = new Node({ name: 'New node' })
                newNode.setFixed(true).setCoords([coords[0], coords[1]])
                this.nodeCreated.emit(newNode)

                canCreate = false
                return
            }

            clock++
        }, 1)
    }

    /**
     * Happens when create mode is enabled and the user starts
     * dragging a line from a node. Dragging from anywhere else than
     * a node will result in nothing.
     */
    graphOnRelationshipDragStart(n: NodeInterface)
    {
        if (false === State.createModeEnabled) { return }
        if (null !== State.dragline) { return } // forbid having two draglines on the graph

        // fix glitch n°g001
        this.svg.classed('dragging-around-fix', true)

        // make dragline start at node position
        // check the node has a valid ID property
        if (typeof(n.getId()) === 'undefined' || n.getId() === 0) {
            return
        }

        // create a dragline and let the end of the line correspond
        // to the mouse pointer coords relative to ths svg container
        // to avoid ugly line from mouse to 0:0 coords by default
        // the event here depends on where this method is called (but we make sur eeits a mouse drag event)
        State.dragline = Shape.createDragline([ n.x, n.y, n.x, n.y ])

        State.dragline
            .attr('data-source', n.getId())
            .beeingDragged(true)
    }

    /**
     * Happens when create mode is enabled and the user releases
     * a dragging action started on a node onto another node.
     * Realeasing the mouse anywhere else will resutl in nothing.
     */
    graphOnRelationshipDragEnd() // and not n: NodeInterface, we are not sure we release on a node yes
    {
        if (false === State.createModeEnabled) { return }
        if (null === State.dragline) { return } // forbid having two draglines on the graph

        const element = d3.select(d3.event.target)

        // unfix glitch n°g001
        this.svg.classed('dragging-around-fix', false)

        // make sure we release on a circle and a circle of class "node" (just to make sure)
        // cancel everything if the lien is not dragged on a valid node
        if (element.property('nodeName') !== 'circle') {
            this.graphOnRelationshipDragFinished()
            return
        }

        const node: NodeInterface = element.datum()
        const sourceId = parseInt(State.dragline.attr('data-source'))
        const targetId = node.getId()

        // prevent creating relationships from self to self
        if (sourceId === targetId) {
            console.warn(`graph.component.ts Not a good idea to create a relationship from node to the same node`)
            this.graphOnRelationshipDragFinished()
            return
        }

        const source: NodeInterface = Finder.in(this.nodes).findById(sourceId)
        const target: NodeInterface = Finder.findById(targetId)

        State.dragline.remove()
        State.dragline = null

        this.relationshipCreate.emit({ source: source, target: target })
        this.graphOnRelationshipDragFinished()
    }

    graphOnRelationshipDragFinished()
    {
        const element = d3.select(d3.event.target)

        if (null !== State.dragline) {
            State.dragline.remove()
            State.dragline = null
        }

        if (true === State.createModeEnabled && element.property('nodeName') !== 'circle') {
            State.cursor.show()
        }
    }

    calculateWidthAndHeight()
    {
        // set svg canvas dynamic width and height
        this.width = this.elementRef.nativeElement.offsetWidth;
        this.height = this.elementRef.nativeElement.offsetHeight;
    }
}
