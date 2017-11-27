import * as moment from 'moment';
import { PipeTransform, Pipe } from '@angular/core';

@Pipe({ name: 'nicedate', pure: false })
export class NiceDate implements PipeTransform {
    transform(value: string|number, args: string[]) : any {
        
        if (typeof(value) === 'number') {

            const date = moment(value);
            return date.format('ddd HH:mm A');

        } else {
            return value;
        }
    }
}
