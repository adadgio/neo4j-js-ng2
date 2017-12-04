import * as tinycolor       from 'tinycolor2'
import { NodeInterface }    from '../../../neo4j/model';
import { name, color, truncate } from '../../../neo4j/utils';
import { Mouse }            from './mouse';

class ShapeSingleton
{
    private svg: any;

    attach(svg: any)
    {
        this.svg = svg;
    }

    /**
     * Creates the hidden drag line when linking two nodes.
     * Default coords are the line
     */
    createDragline(defaultCoords: [number, number, number, number] = [5, 5, 100, 100]): any
    {
        // line displayed when dragging new nodes
        let dragline: any = this.svg.append('line')
            .attr('x1', defaultCoords[0])
            .attr('y1', defaultCoords[1])
            .attr('x2', defaultCoords[2])
            .attr('y2', defaultCoords[3])
            .attr('class', 'dragline')
            .attr('marker-end', 'url(#dragline-arrow)')

        this.svg.append('svg:defs').append('svg:marker')
            .attr('id', 'dragline-arrow')
            .attr('class', 'dragline-arrow')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 6)
            .attr('markerWidth', 3)
            .attr('markerHeight', 3)
            .attr('orient', 'auto')
            .append('svg:path')
            .attr('d', 'M0,-5L10,0L0,5')

        dragline.currentlyBeeingDragged = false

        dragline.hide = () => {
            dragline.classed('hidden', true)
        }

        dragline.show = () => {
            dragline.classed('hidden', false)
        }

        dragline.beeingDragged = (value: boolean = null) => {
            dragline.currentlyBeeingDragged = value
        }

        dragline.isBeeingDragged = () => {
            return dragline.currentlyBeeingDragged
        }

        return dragline;
    }

    /**
     * Creates a circle that shows up when creating a new node in create mode.
     */
    createCursor()
    {
        let cursor: any = this.svg.append('circle')
            .attr('r', 30)
            .attr('id', 'cursor')
            .attr('transform', 'translate(-100,-100)')
            .attr('class', 'cursor')

        cursor.resetStyle = function() {
            this.transition().style('stroke', '#ABB1BB').style('stroke-width', '1.4px').attr('r', 30)
        }

        cursor.animate = function () {
            this.transition().delay(2).duration(500)
            .attr('r', 15)
            .style('stroke', '#F2F2DC')
            .style('stroke-width', '3px')
        }

        cursor.hide = function () {
            this.classed('hidden', true)
        }

        cursor.show = function () {
            this.classed('hidden', false)
        }

        return cursor;
    }

    appendNodeGroupShapes(groupsRef: any, settings: any)
    {
        // find node default label shown on the ui
        const nameOptions = settings.get('graph.nodes.displayNameOptions')
        const colorOptions = settings.get('graph.nodes.displayColorOptions')
        let circleColor: string = '';

        // then append a circle to the group
        groupsRef.append('circle')
            .attr('class', 'node')
            .attr('r', 20)
            .style('fill', (n: NodeInterface) => {
                circleColor = color(n, colorOptions)
                return circleColor
            })
            .style('stroke', (n: NodeInterface) => {
                return tinycolor(circleColor).lighten(15).toString()
            })

        groupsRef.append('circle')
                .attr('class', 'ring')
                .attr('r', 23)

        groupsRef.append('text')
            .attr('class', 'label')
            .text((n: NodeInterface) => {
                return `[${n.getId().toString()}] ` + truncate(name(n, nameOptions), 6);
            })
            
        // groupsRef.append('circle')
        //     .attr('class', 'expander')
        //     .attr('r', 7)
        //     .attr('cx', 22)
        //     .attr('cy', -18)
        // groupsRef.append('circle')
        //     .attr('class', 'expander expander-inner')
        //     .attr('r', 3)
        //     .attr('cx', 22)
        //     .attr('cy', -18)

        // groupsRef.append('svg:image')
        //     .attr('xlink:href', './assets/svg/icon8-plus.svg')
        //     .attr('width', 17)
        //     .attr('height', 17)
        //     .attr('cx', 10)
        //     .attr('cy', -5)
    }

    appendShapesToLinkGroups(group: any, settings: any)
    {
        const nameOptions = settings.get('graph.links.displayNameOptions')

        group
            .append('line')
            .attr('class', 'link')
            .attr('marker-end', 'url(#link-arrow)')

        group.append('line')
            .attr('class', 'link-overlay')

        group.append('text')
            .attr('class', 'link-text')
            .attr('dy', 14)
            .text((l, i) => {
                return name(l.relationship, nameOptions) + ` [${l.relationship.ID}]`;
            })
            .attr('text-anchor', 'middle')

        group.append('svg:defs').append('svg:marker')
            .attr('id', 'link-arrow')
            .attr('class', 'link-arrow')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 10)
            .attr('markerWidth', 5)
            .attr('markerHeight', 5)
            .attr('orient', 'auto')
            .append('svg:path')
            .attr('d', 'M0,-5L10,0L0,5')
    }
}

export let Shape = new ShapeSingleton()
