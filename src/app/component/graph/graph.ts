declare var window: any;
import * as d3 from 'd3';
import { Node } from './node';

export class Graph
{
    private selector: string;
    private width: number = 400;
    private height: number = 400;

    private svg: any;
    private force: any;

    private nodes: Array<any> = [];
    private links: Array<any> = [];
    private nodesRef: any;
    private linksRef: any;

    private nodeGroupsRef: any;
    private linksGroupsRef: any;

    constructor(selector: string)
    {
        this.selector = selector;
        this.init()
    }
    
    init()
    {
        // d3.select(window)
        //     .on('keyup', (e) => {
        //         console.log('key up', e)
        //     })
        //     .on('keydown', (e) => {
        //         console.log('key down', e)
        //     })

        this.svg = d3.select(this.selector)
            // .on('mouseup', (e) => {
            //     console.log('mouse up', e)
            // })
            // .on('mousedown', (e) => {
            //     console.log('mouse down', e)
            // })
            // .on('mousemove', (e) => {
            //
            // })

        this.force = d3.layout.force()
            .nodes([]).links([])
            .charge(-60).linkDistance(30).size([this.width, this.height])
            .on('tick', (e) => {
                this.onTick(this.nodesRef, this.linksRef)
            })

        this.nodes = this.force.nodes()
        this.links = this.force.links()
        this.nodesRef = this.svg.selectAll('.node', (n) => { return n.getId() })
        this.linksRef = this.svg.selectAll('.link')
        this.nodeGroupsRef = this.svg.selectAll('.node-group')
        this.linksGroupsRef = this.svg.selectAll('.link-group')
    }

    update()
    {
        this.nodesRef = this.nodesRef.data(this.nodes, (n) => { return n.getId() })

        // first append a group in which the circle will fit
        this.nodeGroupsRef = this.nodesRef
            .enter()
            .append('g')
            // .attr("transform", "translate(100,100)")
            .attr('class', 'node-group')
            // .call(this.force.drag)

        // and exit group drawing
        this.nodesRef.exit().remove()

        // then append a circle to the group
        this.nodeGroupsRef.append('circle')
            .attr('class', 'node red')
            .attr('r', 5)

        // this.nodesRef.exit().remove()
        this.force.start();
    }

    addNode(node: Node)
    {
        // node.x = 500;
        // node.y = 250;

        this.nodes.push(node)
        this.update()
    }

    // drawNodeGroup()
    // {
    //     this.nodesRef
    //         .enter()
    //         .append('g')
    //         .attr('class', 'node-group')
    //
    //     this.nodesRef.exit().remove()
    //
    //     this.nodeGroupsRef.append('circle')
    //         .attr('class', 'node red')
    //         .attr('r', 5)
    // }

    onTick(node: any, link: any)
    {
        node.attr("transform", function (d) {
           return 'translate(' + [d.x, d.y] + ')';
        });

        link
            // .attr("x1", function(d) { return d.source.x; })
            // .attr("y1", function(d) { return d.source.y; })
            .attr("x1", function(d) {
                var angle = Math.atan2(d.target.y - d.source.y, d.target.x - d.source.x);
                return d.source.x + Math.cos(angle) * (20);
            })
            .attr("y1", function(d) {
                var angle = Math.atan2(d.target.y - d.source.y, d.target.x - d.source.x);
                return d.source.y + Math.sin(angle) * (20);
            })
            // .attr("x2", function(d) { return d.target.x; })
            //.attr("y2", function(d) { return d.target.y; })
            .attr("x2", function(d) {
                var angle = Math.atan2(d.target.y - d.source.y, d.target.x - d.source.x);
                return d.target.x - Math.cos(angle) * (20 + 4);
            })
            .attr("y2", function(d) {
                var angle = Math.atan2(d.target.y - d.source.y, d.target.x - d.source.x);
                return d.target.y - Math.sin(angle) * (20 + 4);
            });
    }
}
