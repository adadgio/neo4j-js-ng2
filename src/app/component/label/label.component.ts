import * as tinycolor                   from 'tinycolor2'
import { Component, EventEmitter }      from '@angular/core';
import { Input, Output, OnInit }        from '@angular/core';
import { LabelInterface }               from '../../neo4j/model';

@Component({
    selector: 'label-component',
template: `<a href="" (click)="click($event)" [ngClass]="['label', label.name]" [ngStyle]="{ 'color': textColor, 'background-color': label.color }">
        <span [innerText]="label.name"></span><span *ngIf="displayCount" class="count">({{ label.count }})</span>
    </a>`,
    styleUrls: ['./label.component.scss']
})
export class LabelComponent implements OnInit
{
    textColor: string;
    @Input('label') label: LabelInterface;
    @Input('displayCount') displayCount: boolean = false;
    @Output('onClick') onClick: EventEmitter<any> = new EventEmitter();

    constructor()
    {

    }

    ngOnInit()
    {
        this.textColor = tinycolor(this.label.color).lighten(60).toString()
    }

    click(e: any)
    {
        e.preventDefault();
        this.onClick.emit(this.label)
    }
}
