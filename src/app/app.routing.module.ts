import { NgModule }                 from '@angular/core';
import { RouterModule, Routes }     from '@angular/router';
import { PreloadAllModules }        from '@angular/router';

import { HomePageComponent }        from './page';
import { DebugPageComponent }       from './page';
import { SettingsPageComponent }    from './page';

const APP_ROUTES: Routes = [
    {
        path: '',
        component: HomePageComponent,
        canActivate: [],
    },
    {
        path: 'debug',
        component: DebugPageComponent,
        canActivate: [],
    },
    {
        path: 'settings',
        component: SettingsPageComponent,
        canActivate: [],
    },
    { path: '', redirectTo: '/', pathMatch: 'full' },
];

@NgModule({
    imports: [
        RouterModule.forRoot(
            APP_ROUTES,
            {
                // enableTracing: true, // debugging purposes only
                preloadingStrategy: PreloadAllModules,
            }
        )
    ],
    exports: [
        RouterModule
    ]
})
export class AppRoutingModule { }
