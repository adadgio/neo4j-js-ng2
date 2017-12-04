import { PipeTransform, Pipe } from '@angular/core';

@Pipe({ name: 'entries', pure: false })
export class EntriesPipe implements PipeTransform {
    transform(object: any) : any {
        return Object.entries(object)
    }
}
