import { BehaviorSubject }              from 'rxjs/BehaviorSubject';
import { Component, OnInit }            from '@angular/core';
import { ElementRef, ViewChild }        from '@angular/core';
import { QueryList, HostListener  }     from '@angular/core';
import { Input, Output, EventEmitter }  from '@angular/core';
import { ViewChildren, SimpleChange }   from '@angular/core';
import { MultiSelectOptionComponent }   from './multi-select-option.component';

@Component({
    selector: 'multi-select',
    styleUrls: ['./multi-select.component.scss'],
    template: `<div class="multi-select">

        <div class="selection">

            <input
                #input
                (focus)="onFocus($event)"
                (keyup)="onSearchKeyup($event)"
                class="input-small input-dark"
                type="text"
                [attr.placeholder]="placeholder">

            <div class="selected-items">
                <ng-container *ngFor="let value of values">
                    <multi-select-option
                        [value]="value"
                        [type]="'selected'"
                        (onRemove)="removeItem($event)"
                    ></multi-select-option>
                </ng-container>
            </div>
        </div>

        <div class="dropdown" *ngIf="dropdownVisible">
            <ul>
                <li>
                    <ng-container *ngFor="let value of items">
                        <multi-select-option
                            [value]="value"
                            [type]="'available'"
                            (click)="addItem(value)"
                        ></multi-select-option>
                    </ng-container>
                </li>
            </ul>
        </div>
    </div>`,

})
export class MultiSelectComponent implements OnInit
{
    searchTerm: BehaviorSubject<string> = new BehaviorSubject('');

    @Input('items') items: Array<any> = [];
    @Input('values') values: Array<string|number> = [];
    @Input('dropdownVisible') dropdownVisible: boolean = false;
    @Output('valuesChanged') valuesChanged: EventEmitter<any> = new EventEmitter();
    @Output('valueAdded') valueAdded: EventEmitter<any> = new EventEmitter();
    @Output('valueRemoved') valueRemoved: EventEmitter<any> = new EventEmitter();
    @ViewChild('input') input: ElementRef;

    placeholder: string;
    areValuesScalar: boolean = false;

    constructor(private elementRef: ElementRef)
    {

    }

    ngOnInit()
    {

    }

    @HostListener('document:click', ['$event'])
    onClickOut(e: any)
    {
        if (!this.elementRef.nativeElement.contains(e.target)) {
            this.dropdownVisible = false;
        }
    }

    onFocus(e: any)
    {
        this.dropdownVisible = true;

    }

    onSearchKeyup(e: any)
    {
        const term = e.target.value.toLowerCase().trim()

        if (term !== '') {
            this.dropdownVisible = true
            this.searchTerm.next(term)
        } else {
            this.dropdownVisible = false
        }
    }

    filter(term: string, items: Array<string>)
    {
        // if (null === term) {
        //     return items;
        // } else {
        //     return items.filter((item) => {
        //         return (item.name.toLowerCase().indexOf(term) > -1) ? true : false
        //     })
        // }
    }

    addItem(value: string)
    {
        this.dropdownVisible = false;

        if (this.values.indexOf(value) === -1) {
            this.values.push(value);
            this.items.splice(this.items.indexOf(value), 1);
            this.valuesChanged.emit(this.values);
            this.valueAdded.emit(value)
        }
    }

    removeItem(value: string)
    {
        const index = this.values.indexOf(value);
        this.values.splice(index, 1);

        if (this.items.indexOf(value) === -1) {
            this.items.push(value);
        }

        this.valueRemoved.emit(value)
        this.valuesChanged.emit(this.values);
    }

    getValues() {
        return this.values;
    }
}
