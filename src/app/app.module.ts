/*
 * Copyright 2018 InfAI (CC SES)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {BrowserModule} from '@angular/platform-browser';
import {APP_INITIALIZER, NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {CoreModule} from './core/core.module';
import {AppRoutingModule} from './/app-routing.module';
import {AppsModule} from './modules/apps/apps.module';
import {StartModule} from './modules/start/start.module';
import {HttpClientModule} from '@angular/common/http';
import {KeycloakAngularModule, KeycloakService} from 'keycloak-angular';
import {keycloakInitializerService} from './core/services/keycloak-initializer.service';
import {DevicesModule} from './modules/devices/devices.module';
import {DashboardModule} from './modules/dashboard/dashboard.module';
import {DataModule} from './modules/data/data.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        CoreModule,
        AppRoutingModule,
        DashboardModule,
        AppsModule,
        StartModule,
        DevicesModule,
        KeycloakAngularModule,
        DataModule,
        BrowserAnimationsModule
    ],
    providers: [
        {
            provide: APP_INITIALIZER,
            useFactory: keycloakInitializerService,
            multi: true,
            deps: [KeycloakService]
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}