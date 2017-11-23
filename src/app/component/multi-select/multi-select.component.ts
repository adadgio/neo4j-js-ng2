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
                [ngClass]="(false === multiple && selectedItems.length === 0) ? 'visible' : 'hidden'"
                #input
                (focus)="onFocus($event)"
                (keyup)="onSearchKeyup($event)"
                class="input-small"
                type="text"
                [attr.placeholder]="placeholder">

            <div class="selected-items">
                <ng-container *ngFor="let item of selectedItems">
                    <multi-select-option
                        [item]="item"
                        [type]="'selected'"
                        (onRemove)="removeItem($event)"
                    ></multi-select-option>
                </ng-container>
            </div>
        </div>

        <div class="dropdown" *ngIf="dropdownVisible">
            <ul>
                <li>
                    <ng-container *ngFor="let item of filter(searchTerm.getValue(), availableItems)">
                        <multi-select-option
                            [item]="item"
                            [type]="'available'"
                            (click)="addItem(item)"
                        ></multi-select-option>
                    </ng-container>
                </li>
                <li *ngIf="searchTerm.getValue() != '' && filter(searchTerm.getValue(), availableItems).length === 0">
                    <span class="empty-results-text"><i>No results</i></span>
                </li>
            </ul>
        </div>
    </div>`,

})
export class MultiSelectComponent implements OnInit
{
    dropdownVisible: boolean = false;

    selectedItems: Array<any> = [];
    availableItems: Array<any> = [];
    searchTerm: BehaviorSubject<string> = new BehaviorSubject('');

    @Input('items') items: Array<any> = [];
    @Input('values') values: Array<string|number> = [];
    @Output('valuesChanged') valuesChanged: EventEmitter<any> = new EventEmitter();
    @ViewChild('input') input: ElementRef;

    areValuesScalar: boolean = false;

    constructor(private elementRef: ElementRef)
    {

    }

    ngOnInit()
    {
        for (let i in this.items) {
            let item = this.items[i];

            // crate an object from scalar array if a simple array is passed
            if (typeof(item) !== 'object') {
                item = this.scalarToItemObject(item)
                this.areValuesScalar = true;
            }

            if (this.values.indexOf(item.id) > -1) {
                this.selectedItems.push(item)
            } else {
                this.availableItems.push(item)
            }
        }
    }
    
    scalarToItemObject(value: string|number)
    {
        return { id: value, name: value };
    }

    trackByFn(index, item)
    {
        return item.id;
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
        if (this.availableItems.length > 0) {
            this.dropdownVisible = true;
        }
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

    filter(term: string, items: Array<any>)
    {
        if (null === term) {
            return items;
        } else {
            return items.filter((item) => {
                return (item.name.toLowerCase().indexOf(term) > -1) ? true : false
            })
        }
    }

    addItem(item: any)
    {
        this.dropdownVisible = false;
        this.selectedItems.push(item)
        this.removeById(item.id, this.availableItems)

        // this.searchTerm.next('')
        // this.input.nativeElement.focus()
        // this.input.nativeElement.value = '';
        this.valuesChanged.emit(this.selectedItems)
    }

    removeItem(item: any)
    {
        this.availableItems.push(item)
        this.removeById(item.id, this.selectedItems)

        this.valuesChanged.emit(this.selectedItems)
    }

    getValues() {
        return this.values;
    }

    removeById(id: number, items: Array<any>)
    {
        for (let i in items) {
            const item = items[i];

            if (item.id === id) {
                items.splice(parseInt(i), 1)
            }
        }

        return items;
    }

    getIndexOf(id: number, items: Array<any>): number {
        for (let i in items) {
            if (id === items[i]['id']) {
                return parseInt(i);
            }
        }
        return null;
    }
}
