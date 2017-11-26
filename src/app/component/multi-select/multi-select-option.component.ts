import { BehaviorSubject }              from 'rxjs/BehaviorSubject';
import { Component, OnInit  }           from '@angular/core';
import { ElementRef, ViewChild }        from '@angular/core';
import { HostListener  }                from '@angular/core';
import { Input, Output, EventEmitter }  from '@angular/core';

@Component({
    selector: 'multi-select-option',
    styleUrls: ['./multi-select-option.component.scss'],
    template: `<div class="multi-select-option"
        [ngClass]="[type]"
        
        >
            <span class="value" [innerText]="value"></span>
            <a *ngIf="type === 'selected'" href="" class="rm" (click)="remove(value, $event)">x</a>
    </div>`,
    //[ngStyle]="{ 'background-color': (value.color && type === 'selected') ? value.color : 'none' }"
})
export class MultiSelectOptionComponent
{
    @Input('value') value: any;
    @Input('type') type: 'selected'|'available';
    @Output('onRemove') onRemove: EventEmitter<any> = new EventEmitter();

    remove(value, e?: MouseEvent)
    {
        e.preventDefault()
        this.onRemove.emit(this.value)
    }
}
