import { Injectable }   from '@angular/core';
import { Subject }      from 'rxjs/Subject';
import { Observable }   from 'rxjs/Observable';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';

interface BroadcastEvent {
  key: any;
  data?: any;
}

export class BroadcastServiceModule
{
    private _eventBus: Subject<BroadcastEvent>;

    constructor() {
        this._eventBus = new Subject<BroadcastEvent>();
    }
    
    emit(key: any, data?: any) {
        this._eventBus.next({key, data});
    }

    on<T>(key: any): Observable<T> {
        return this._eventBus.asObservable()
            .filter(event => event.key === key)
            .map(event => <T>event.data)
    }
}

export let BroadcastService = new BroadcastServiceModule();
