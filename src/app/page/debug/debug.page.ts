import { Component }                from '@angular/core';
import { OnInit, AfterViewInit }    from '@angular/core';
import { Router }                   from '@angular/router';
import { Debug }                    from '../../service';

@Component({
    selector: 'debug-page',
    templateUrl: './debug.page.html',
    styleUrls: ['./debug.page.scss']
})
export class DebugPageComponent implements OnInit, AfterViewInit
{
    logs: Array<any> = []

    constructor(private router: Router)
    {

    }

    ngOnInit()
    {
        this.logs = Debug.getMessages()
    }

    ngAfterViewInit()
    {

    }

    clear(e: any)
    {
        e.preventDefault()
        this.logs = []
        Debug.clear()
    }
}
