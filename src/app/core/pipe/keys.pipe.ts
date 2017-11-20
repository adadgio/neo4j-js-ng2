import { PipeTransform, Pipe } from '@angular/core';

@Pipe({ name: 'keys', pure: false })
export class KeysPipe implements PipeTransform {
  transform(value, args:string[]) : any {
    let keys = [];
    for (let key in value) {
        keys.push(key);
    }
    return keys;
  }
}
