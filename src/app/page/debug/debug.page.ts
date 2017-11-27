import { Component }                from '@angular/core';
import { OnInit, AfterViewInit }    from '@angular/core';
import { Router }                   from '@angular/router';
import { Debug }                    from '../../service';
import { group }                    from '../../core/array';

@Component({
    selector: 'debug-page',
    templateUrl: './debug.page.html',
    styleUrls: ['./debug.page.scss']
})
export class DebugPageComponent implements OnInit, AfterViewInit
{
    groups: Array<any> = []

    constructor(private router: Router)
    {

    }

    ngOnInit()
    {
        const messages = Debug.getMessages()
        this.groups = group('timestamp', messages)
    }

    ngAfterViewInit()
    {

    }

    toggleTrace(e: any, i: number, j: number)
    {
        e.preventDefault()

        let status = (typeof this.groups[i][j]['hidden'] === 'undefined') ? true : this.groups[i][j]['hidden']
        this.groups[i][j]['hidden'] = !status
    }

    clear(e: any)
    {
        e.preventDefault()
        this.groups = []
        Debug.clear()
    }
}
