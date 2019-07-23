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

import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {WidgetModel} from '../../modules/dashboard/shared/dashboard-widget.model';
import {MatIconRegistry} from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser';
import {EnergyPredictionService} from './shared/energy-prediction.service';
import {EnergyPredictionModel} from './shared/energy-prediction.model';
import {DashboardService} from '../../modules/dashboard/shared/dashboard.service';
import {Subscription} from 'rxjs';

@Component({
    selector: 'senergy-energy-prediction',
    templateUrl: './energy-prediction.component.html',
    styleUrls: ['./energy-prediction.component.css'],
})
export class EnergyPredictionComponent implements OnInit, OnDestroy {

    predictionModel: EnergyPredictionModel = {prediction: 0, timestamp: ''};
    ready = false;
    destroy = new Subscription();
    thresholdActive = false;
    price = 0;
    timestamp = '';

    @Input() dashboardId = '';
    @Input() widget: WidgetModel = {id: '', type: '', name: '', properties: {}};
    @Input() zoom = false;

    constructor(private iconRegistry: MatIconRegistry,
                private sanitizer: DomSanitizer,
                private predictionService: EnergyPredictionService,
                private dashboardService: DashboardService) {
    }

    ngOnInit() {
        this.update();
        this.registerIcons();
    }

    ngOnDestroy() {
        this.destroy.unsubscribe();
    }

    registerIcons() {
        this.iconRegistry.addSvgIcon('online', this.sanitizer.bypassSecurityTrustResourceUrl('src/img/connect_white.svg'));
        this.iconRegistry.addSvgIcon('offline', this.sanitizer.bypassSecurityTrustResourceUrl('src/img/disconnect_white.svg'));
    }

    edit() {
        this.predictionService.openEditDialog(this.dashboardId, this.widget.id);
    }

    private update() {
        this.destroy = this.dashboardService.initWidgetObservable.subscribe((event: string) => {
            if (event === 'reloadAll' || event === this.widget.id) {
                this.ready = false;
                this.predictionService.getPrediction(this.widget).subscribe((devicesStatus: EnergyPredictionModel) => {
                    this.predictionModel = devicesStatus;
                    this.price = this.predictionModel.prediction * (this.widget.properties.price || 0);
                    switch (this.widget.properties.thresholdOption) {
                        case 'Consumption':
                            this.thresholdActive = this.predictionModel.prediction > (this.widget.properties.threshold || Infinity);
                            break;
                        case 'Price':
                            this.thresholdActive = this.price > (this.widget.properties.threshold || Infinity);
                            break;
                    }
                    this.ready = true;
                });
            }
        });
    }
}