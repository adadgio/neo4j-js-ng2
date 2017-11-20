import { Component }            from '@angular/core';
import { Input, ElementRef }    from '@angular/core';
import { Router }               from '@angular/router';
import { Neo4jService }         from '../../neo4j';

@Component({
    selector: 'header-component',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent
{
    neo4jOk: boolean = false;

    constructor(private router: Router, private neo4j: Neo4jService)
    {
        this.neo4j.ping().then((yes: boolean) => {
            this.neo4jOk = yes
        }, (res: any) => {
            this.neo4jOk = false
        }).catch(err => {
            console.log(err)
            this.neo4jOk = false
        })
    }

    onOptionSelected(e: any)
    {
        console.log(e)
    }

    logout(e: Event)
    {
        e.preventDefault()
    }
}
