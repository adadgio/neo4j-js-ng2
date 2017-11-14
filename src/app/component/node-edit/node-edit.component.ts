import { Component }                from '@angular/core';
import { OnInit, AfterViewInit }    from '@angular/core';
import { Input, Output }            from '@angular/core';
import { Node }                     from '../../neo4j';

@Component({
    selector: 'node-edit',
    templateUrl: './node-edit.component.html',
    styleUrls: ['./node-edit.component.scss']
})
export class NodeEditComponent implements OnInit, AfterViewInit
{
    @Input('node') node: Node;

    constructor()
    {

    }
    
    ngOnInit()
    {

    }

    ngAfterViewInit()
    {

    }
}
