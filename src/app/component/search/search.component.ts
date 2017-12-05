import { Subject, Observable }                      from 'rxjs';
import { HostListener, ElementRef }                 from '@angular/core';
import { Input, Output, Component }                 from '@angular/core';
import { OnInit, HostBinding, EventEmitter }        from '@angular/core';
import { AfterViewInit, Renderer, ViewChild }       from '@angular/core';
import { CypherQuery, SimpleQuery }                 from '../../neo4j/orm';

@Component({
    selector: 'search-component',
    styleUrls: ['./search.component.scss'],
    template: `<div class="search">
        <form (ngSubmit)="onSubmit($event)" *ngIf="(mode === 'normal')">
            <div class="controls search-bar">
                <app-button primary icon-only><i class="icon-search"></i></app-button>
                <input type="text" value="" [(ngModel)]="normalQueryString" name="normal_query" placeholder=":Person id=5 name=Bernie 10,5" class="input-large" autocomplete="off">
                <a *ngIf="!loading" class="info" href="" (click)="toggleMode($event)">
                    <i class="icon-earth"></i>
                </a>
                <a *ngIf="loading" class="info info-loader" href="#">
                    <img class="svg-loader" src="assets/svg/three-dots.svg" width="20" alt="Loading...">
                </a>
            </div>
        </form>
        <form (ngSubmit)="onSubmit($event)" *ngIf="(mode === 'advanced')">
            <div class="controls query-bar">
                <app-button primary icon-only><i class="icon-search"></i></app-button>
                <input type="text" value="" [(ngModel)]="cypherQueryString" name="cypher_query" placeholder="MATCH (n) RETURN n, LABELS(n), ID(n)" class="input-large input-code" autocomplete="off">
                <a *ngIf="!loading" class="info" href="" (click)="toggleMode($event)">
                    <i class="icon-embed2"></i>
                </a>
                <a *ngIf="loading" class="info info-loader" href="#">
                    <img class="svg-loader" src="assets/svg/three-dots.svg" width="20" alt="Loading...">
                </a>
            </div>
        </form>
    </div>`,
    providers: [],
})
export class SearchComponent implements OnInit, AfterViewInit
{
    @Input('loading') loading: boolean = false;
    @Input('mode') mode: 'normal'|'advanced' = 'normal';
    @Output('onSearch') onSearch = new EventEmitter();
    @ViewChild('searchInput') searchInput: ElementRef;

    normalQueryString: string = ''; //  name="Planning de garde" 10,0
    cypherQueryString: string = ''; //'MATCH (a) RETURN a, LABELS(a), ID(a) LIMIT 10';

    normalQueryRelLevel: number = 0;
    normalQueryLimit: number = 30;
    normalQuerySkip: number = null;

    ngKlasses: string;
    term: Subject<string> = new Subject();

    constructor(private renderer: Renderer, private elementRef: ElementRef)
    {

    }

    ngOnInit()
    {

    }

    ngAfterViewInit()
    {

    }

    toggleMode(e: any)
    {
        e.preventDefault()
        this.mode = (this.mode === 'normal') ? 'advanced' : 'normal';
    }

    onSubmit(e: any)
    {
        e.preventDefault()
        let queryString: string;

        if (this.mode === 'normal') {

            const simple = new SimpleQuery(this.normalQueryString, this.normalQueryRelLevel)
            queryString = simple.getQuery();
            this.onSearch.emit({ mode: this.mode, queryString: queryString })

        } else {

            this.onSearch.emit({ mode: this.mode, queryString: this.cypherQueryString })
        }


    }
}
