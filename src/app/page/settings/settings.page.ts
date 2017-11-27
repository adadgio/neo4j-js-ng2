import { Component, ViewChild, ElementRef }     from '@angular/core';
import { Router } from '@angular/router';
import { OnInit, AfterViewInit, OnChanges }     from '@angular/core';
import { SimpleChanges }                        from '@angular/core';
import { SettingsService }                      from '../../service';

@Component({
    selector: 'settings-page',
    templateUrl: './settings.page.html',
    styleUrls: ['./settings.page.scss']
})
export class SettingsPageComponent implements OnInit, AfterViewInit, OnChanges
{
    settingsString: string;
    errorText: string = null;
    successText: string = null;

    @ViewChild('settingsEditor') settingsEditor: ElementRef;

    constructor(private elementRef: ElementRef, private settings: SettingsService, private router: Router)
    {
        const data = settings.get()
        this.settingsString = JSON.stringify(data, null, 2)
    }
    
    ngOnInit()
    {

    }

    ngAfterViewInit()
    {

    }

    ngOnChanges(changes: SimpleChanges)
    {
        // console.log(changes)
    }

    save(e?: any)
    {
        if (e) { e.preventDefault() }

        const data = this.settingsEditor.nativeElement.innerText

        try {
            this.errorText = null;
            this.successText = `Settings saved`;

            const json = JSON.parse(data)

            this.settings.set(json, true)
            this.settingsString = JSON.stringify(json, null, 2)

        } catch (e) {
            this.errorText = 'Invalid JSON';
            this.successText = null;
        }
    }

    reset(e?: any)
    {
        if (e) { e.preventDefault() }
        this.errorText = null;
        this.successText = `Settings reset to defaults`;
        this.settings.reset()
    }

    cancel(e?: any)
    {
        if (e) { e.preventDefault() }
        this.router.navigateByUrl('/')
    }
}
