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
        [ngStyle]="{ 'background-color': (item.color && type === 'selected') ? item.color : 'none' }"
        >
            <span class="item" [innerText]="item.name"></span>
            <a *ngIf="type === 'selected'" href="" class="rm" (click)="remove(item, $event)">x</a>
    </div>`,
})
export class MultiSelectOptionComponent
{
    @Input('item') item: any;
    @Input('type') type: 'selected'|'available';
    @Output('onRemove') onRemove: EventEmitter<any> = new EventEmitter();

    remove(item, e?: MouseEvent)
    {
        e.preventDefault()
        this.onRemove.emit(this.item)
    }
}
