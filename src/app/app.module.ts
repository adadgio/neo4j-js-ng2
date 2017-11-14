import { BrowserModule }    from '@angular/platform-browser';
import { NgModule }         from '@angular/core';
import { APP_INITIALIZER }  from '@angular/core';
import { FormsModule }      from '@angular/forms';
import { Http, HttpModule } from '@angular/http';

import { bootstrap }             from './bootstrap';
import { AppComponent }         from './app.component';
import { AppRoutingModule }     from './app.routing.module';

import { SettingsService }      from './service';
import { Neo4jService }         from './neo4j';
import { HomePageComponent }    from './page';

import { NodeEditComponent }    from './component';

@NgModule({
    declarations: [
        AppComponent,
        
        HomePageComponent,
        NodeEditComponent
    ],
    imports: [
        BrowserModule,
        BrowserModule,
        HttpModule,
        FormsModule,
        AppRoutingModule
    ],
    providers: [
        {
            provide: APP_INITIALIZER,
            useFactory: bootstrap,
            deps: [ Http, SettingsService ],
            multi: true
        },
        SettingsService,
        Neo4jService,
    ],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule { }
