import { Subject, Observable }                      from 'rxjs';
import { HostListener, ElementRef }                 from '@angular/core';
import { Input, Output, Component }                 from '@angular/core';
import { OnInit, HostBinding, EventEmitter }        from '@angular/core';
import { AfterViewInit, Renderer, ViewChild }       from '@angular/core';

@Component({
    selector: 'search-component',
    styleUrls: ['./search.component.scss'],
    template: `<div class="search">
        <form (ngSubmit)="onSubmit($event)">
            <div class="controls">
                <app-button primary icon-only><i class="icon-search"></i></app-button>
                <input type="text" value="" [(ngModel)]="normalQueryString" name="normal_query" placeholder="Rechercher..." class="input-large">
                <a class="info" href="" (click)="toggleMode($event)"><i class="icon-earth"></i></a>
            </div>
        </form>
        <form class="query-bar" *ngIf="(mode === 'advanced')">
            <app-button primary><i class="icon-search"></i></app-button>
            <input type="text" value="" [(ngModel)]="cypherQueryString" name="cypher_query" placeholder="Cypher query..." class="input-large">
            <a class="info" href="" (click)="toggleMode($event)"><i class="icon-embed2"></i></a>
        </form>
    </div>`,
    providers: [],
})
export class SearchComponent implements OnInit, AfterViewInit
{
    // @Input('loading') loading: boolean = false;
    // @Input('options') options: any = {
    //     iconPosition: 'right',
    //     emphasis: false,
    // };

    @Input('mode') mode: 'normal'|'advanced' = 'normal';
    @Output('onSearch') onSearch = new EventEmitter();

    @ViewChild('searchInput') searchInput: ElementRef;

    normalQueryString: string = '';
    cypherQueryString: string = '';

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
        // this.renderer.setElementStyle(this.el.nativeElement, 'width', '200px');
    }

    ngOnDestroy()
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
        const query = (this.mode === 'normal') ? this.normalQueryString : this.cypherQueryString;
        this.onSearch.emit({ mode: this.mode, query: query })
    }
}
