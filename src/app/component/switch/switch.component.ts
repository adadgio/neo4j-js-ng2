import { Subject, Observable }                      from 'rxjs';
import { HostListener, ElementRef }                 from '@angular/core';
import { Input, Output, Component }                 from '@angular/core';
import { OnInit, HostBinding, EventEmitter }        from '@angular/core';
import { AfterViewInit, Renderer, ViewChild }       from '@angular/core';

@Component({
    selector: 'switch-component',
    styleUrls: ['./switch.component.scss'],
    template: `<div class="switch" (click)="toggle($event)" [ngClass]="(value === true) ? 'on' : 'off'">
        <div class="knob"></div>
    </div>`
})
export class SwitchComponent implements OnInit, AfterViewInit
{
    @Input('value') value: boolean = false
    @Output('change') onChange: EventEmitter<boolean> = new EventEmitter();

    constructor()
    {


    }

    ngOnInit()
    {

    }

    ngAfterViewInit()
    {

    }

    toggle(e: any)
    {
        this.value = !this.value
        this.onChange.emit(this.value)
    }
}
