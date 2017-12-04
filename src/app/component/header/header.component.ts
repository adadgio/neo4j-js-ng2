import { Component }            from '@angular/core';
import { Input, ElementRef }    from '@angular/core';
import { Router }               from '@angular/router';
import { Neo4jService }         from '../../neo4j';
import { Debug }                from '../../service';

@Component({
    selector: 'header-component',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent
{
    neo4jOk: boolean = false;
    tutorialIsVisible: boolean = false;
    criticalErrorsCount: number;

    constructor(private router: Router, private neo4j: Neo4jService)
    {
        this.neo4j.ping().then((yes: boolean) => {
            this.neo4jOk = yes
        }, (res: any) => {
            this.neo4jOk = false
        }).catch(err => {
            this.neo4jOk = false
        })
    }

    ngOnInit()
    {
        this.criticalErrorsCount = Debug.countErrorsByLevel('critical')
    }

    logout(e: Event)
    {
        e.preventDefault()
    }

    showTutorial(e: any)
    {
        e.preventDefault()
        this.tutorialIsVisible = true;
    }

    dismissTutorial()
    {
        this.tutorialIsVisible = false;
    }
}
