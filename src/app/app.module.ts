import { BrowserModule }    from '@angular/platform-browser';
import { NgModule }         from '@angular/core';
import { APP_INITIALIZER }  from '@angular/core';
import { FormsModule }      from '@angular/forms';
import { Http, HttpModule } from '@angular/http';

import { bootstrap }             from './bootstrap';
import { AppComponent }         from './app.component';
import { AppRoutingModule }     from './app.routing.module';

import { KeysPipe }             from './core/pipe';
import { EntriesPipe }          from './core/pipe';
import { NiceDate }             from './core/pipe';
import { SettingsService }      from './service';

import { Neo4jService }         from './neo4j';
import { Neo4jRepository }      from './neo4j';

import { HomePageComponent }        from './page';
import { DebugPageComponent }       from './page';
import { SettingsPageComponent }    from './page';

import { HeaderComponent }              from './component';
import { SearchComponent }              from './component';
import { TutorialComponent }            from './component';
import { SwitchComponent }              from './component';
import { ButtonComponent }              from './component';
import { LabelComponent }               from './component';

import { GraphComponent }               from './component';
import { NodeEditComponent }            from './component';
import { LinkEditComponent }            from './component';
import { MultiSelectComponent }         from './component';
import { MultiSelectOptionComponent }   from './component';


@NgModule({
    declarations: [
        AppComponent,

        KeysPipe,
        EntriesPipe,
        NiceDate,

        HeaderComponent,
        SearchComponent,
        TutorialComponent,
        SwitchComponent,
        ButtonComponent,
        LabelComponent,

        GraphComponent,
        NodeEditComponent,
        LinkEditComponent,

        HomePageComponent,
        DebugPageComponent,
        SettingsPageComponent,

        MultiSelectComponent,
        MultiSelectOptionComponent,
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
        Neo4jRepository,
    ],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule { }
