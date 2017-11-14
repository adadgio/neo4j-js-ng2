import { Component }                from '@angular/core';
import { OnInit, AfterViewInit }    from '@angular/core';
import { Node, Graph }              from '../../component';

@Component({
    selector: 'home-page',
    templateUrl: './home.page.html',
    styleUrls: ['./home.page.scss']
})
export class HomePageComponent implements OnInit, AfterViewInit {

    graph: Graph;

    constructor()
    {

    }

    ngOnInit()
    {
        this.graph = new Graph('#graph')
        this.graph.addNode(new Node({ id: 4, name: 'test' }))
        this.graph.addNode(new Node({ id: 3, name: 'test' }))
    }

    ngAfterViewInit()
    {

    }
}
