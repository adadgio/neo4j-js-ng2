import { BrowserModule }    from '@angular/platform-browser';
import { NgModule }         from '@angular/core';
import { FormsModule }      from '@angular/forms';
import { HttpModule }       from '@angular/http';

import { AppComponent }         from './app.component';
import { AppRoutingModule }     from './app.routing.module';

import { HomePageComponent }    from './page';

@NgModule({
    declarations: [
        AppComponent,

        HomePageComponent
    ],
    imports: [
        BrowserModule,
        BrowserModule,
        HttpModule,
        FormsModule,
        AppRoutingModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
