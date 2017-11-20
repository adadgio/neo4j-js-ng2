declare var window: any;
import * as d3 from 'd3';

import { Input, Output, Component }                 from '@angular/core';
import { OnInit, OnChanges, AfterViewInit }         from '@angular/core';
import { ElementRef, HostBinding, EventEmitter }    from '@angular/core';
import { SettingsService }                          from '../../service';
import { Node, NodeInterface }                      from '../../neo4j';
import { Mouse, State, distance }                   from './graph-utils';
import { Shape }                                    from './graph-utils';

@Component({
    selector: 'graph-component',
    styleUrls: ['./graph.component.scss'],
    template: `<svg id="graph" [ngStyle]="{ 'width': width, 'height': height }"></svg>`,
    providers: [],
})
export class GraphComponent implements OnInit, AfterViewInit, OnChanges
{
    @Input('width') width: number = 50;
    @Input('height') height: number = 50;

    private selector: string = 'svg#graph';

    private svg: any;
    private force: any;

    private nodes: Array<any> = []; // force.nodes()
    private links: Array<any> = [];
    private nodesRef: any;
    private linksRef: any;

    @Output('nodeAdded') nodeAdded: EventEmitter<Node> = new EventEmitter()
    @Output('nodeSelected') nodeSelected: EventEmitter<Node> = new EventEmitter()
    @Output('nodeDoubleClicked') nodeDoubleClicked: EventEmitter<Node> = new EventEmitter();

    @Input('createMode') set createMode(mode: boolean) {
        this.toggleCreateMode(mode)
    }

    // @Output('createModeChanged') createModeChanged: EventEmitter<boolean> = new EventEmitter();

    constructor(private elementRef: ElementRef, private settings: SettingsService)
    {

    }

    ngOnInit()
    {
        this.calculateWidthAndHeight()
    }

    ngAfterViewInit()
    {

    }

    ngOnChanges()
    {

    }

    start()
    {
        d3.select(window)
            .on('keyup', (e) => {
                // console.log('key up', e)
            })
            .on('keydown', (e) => {
                // console.log('key down', e)
            })

        this.svg = d3.select(this.selector)
            .on('mouseup', (e) => {
                this.graphOnMouseUp()

                if (null !== State.dragline && State.dragline.isBeeingDragged()) {
                    this.graphOnRelationshipDragEnd()
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

                // let dragline follow mouse position on drag
                if (null !== State.dragline && State.dragline.isBeeingDragged()) {
                    // needs to be called inside a "mouse event" such as here
                    State.dragline.followMousePointer(d3.event)
                    State.cursor.classed('hidden', true)
                }

            })

        this.force = d3.layout.force()
            .nodes([]).links([])
            .charge(-120).linkDistance(30).size([this.width, this.height])
            .on('tick', (e) => {
                this.onTick(this.nodesRef, this.linksRef)
            })

        this.nodes = this.force.nodes()
        this.links = this.force.links()
        this.nodesRef = this.svg.selectAll('circle.node', (n: NodeInterface) => { return n.getId() })
        this.linksRef = this.svg.selectAll('.link')
        // this.nodeGroupsRef = this.svg.selectAll('g.node-group')
        // this.linksGroupsRef = this.svg.selectAll('g.link-group')

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
        this.linksRef = this.linksRef.data(this.links)
        this.nodesRef = this.nodesRef.data(this.nodes, (n: NodeInterface) => { return n.getId() })

        // let linksGroupsRef = this.linksRef.enter().append('line')
        //         .attr('class', 'link')
        //         .attr('marker-end', 'url(#arrow-marker)')
        //         .style('stroke-width') // , function(d) { return Math.sqrt(d.value); })

        // let linksGroupsRef = this.linksRef
        //     .enter().append('g')
        //     .attr('class', 'link-group')

        // linksGroupsRef.append('line')
        //     .attr('marker-end', 'url(#arrow-marker)')
        //     .style('stroke-width') // , function(d) { return Math.sqrt(d.value); })

        // first append a group in which to fit the colored
        // circle the node text label and the outer ring
        // all events are attached to the group and whats inside is just nice design
        let nodeGroupsRefs = this.nodesRef
            .enter()
            .append('g')
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
            .on('mouseover', (n: NodeInterface) => {
                if (State.createModeEnabled) {
                    State.cursor.hide()
                }
                if (null !== State.dragline && State.dragline.isBeeingDragged()) {
                    // enlarge target node
                    // cause bugs and glitches so find another way to do this
                    // d3.select(d3.event.currentTarget).attr('transform', 'scale(1.1)');
                }
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
                    }, 170)
                }
            })
            // .classed('draggable', true)
            .call(this.force.drag)


        Shape.appendNodeGroupShapes(nodeGroupsRefs, this.settings)

        // remove deleted nodes
        // this.linksRef.exit().remove()
        this.nodesRef.exit().remove()

        this.force.start();
    }

    addNode(n: NodeInterface)
    {
        this.nodes.push(n)
        this.update()
        this.nodeAdded.emit(n)
    }

    updateNode(node: NodeInterface)
    {
        const index = this.findNodeIndexById(node.getId())
        if (null === index) { return }

        this.removeNodeByIndex(index)
        this.addNode(node)
        this.update()
    }

    removeNode(node: NodeInterface)
    {
        const index = this.findNodeIndexById(node.getId())
        if (null === index) { return }

        this.removeNodeByIndex(index)
        this.update()
    }

    removeNodeByIndex(index: number)
    {
        this.nodes.splice(index, 1)
        this.update()
    }

    findNodeById(id: number)
    {
        for (let i in this.nodes) {
            if (this.nodes[i].getId() === id) {
                return this.nodes[i]
            }
        }

        return null
    }

    findNodeIndexById(id: number)
    {

        if (typeof id === 'undefined') {
            console.warn(`graph.components.ts Trying to find a node by id but id is undefined, did you return ID(n) in your query?`)
        }

        for (let i in this.nodes) {
            if (this.nodes[i].getId() === id) {
                return parseInt(i)
            }
        }

        return null
    }

    onTick(node: any, link: any)
    {
        node.attr('transform', function (d) {
            // if (false === State.createModeEnabled) {
            //     return `translate(${[d.x, d.y]})`
            // }
            return `translate(${[d.x, d.y]})`
        })
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

    enableCreateMode()
    {
        State.createModeEnabled = true
        d3.selectAll('g.node-group').classed('cell', true)

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
        d3.selectAll('g.node-group').classed('cell', false)

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

        let clock = 0
        let canCreate: boolean = true
        // start css transition effect on the cursor
        State.cursor.animate()

        // start a timer while animateing cursor and let node be created when the timer ends
        State.pushMouseTimer = setInterval(() => {
            if (false === canCreate) {
                clock = 0
                State.cursor.resetStyle()
                clearInterval(State.pushMouseTimerTolerance)
                return
            }

            if (clock >= State.pushMouseTimerTolerance) {

                clock = 0
                canCreate = false
                State.cursor.resetStyle()
                clearInterval(State.pushMouseTimerTolerance)
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

        // make sure we release on a circle and a circle of class "node" (just to make sure)
        // cancel everything if the lien is not dragged on a valid node
        if (element.property('nodeName') !== 'circle') {
            State.dragline.remove()
            State.dragline = null
            return
        }

        const node: NodeInterface = element.datum()
        const sourceId = parseInt(State.dragline.attr('data-source'))
        const targetId = node.getId()

        // remove and reset the dragline
        if (null !== State.dragline) {
            State.dragline.remove()
            State.dragline = null
            return
        }

        // prevent creating relationships from self to self
        if (sourceId === targetId) {
            console.warn(`graph.component.ts Not a good idea to create a relationship from node to the same node`)
            State.dragline.remove()
            State.dragline = null
            return
        }

        const source: NodeInterface = this.findNodeById(sourceId)
        const target: NodeInterface = this.findNodeById(targetId)
        console.log(sourceId, targetId)
        console.log(source, target)

        State.dragline.remove()
        State.dragline = null
    }

    calculateWidthAndHeight()
    {
        // set svg canvas dynamic width and height
        this.width = this.elementRef.nativeElement.offsetWidth;
        this.height = this.elementRef.nativeElement.offsetHeight;
    }
}
