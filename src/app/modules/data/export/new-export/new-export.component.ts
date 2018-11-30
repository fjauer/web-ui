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

import {Component, OnInit} from '@angular/core';
import {PipelineRegistryService} from '../../flow-repo/shared/pipeline-registry.service';
import {PipelineOperatorModel, PipelineModel} from '../../flow-repo/shared/pipeline.model';
import {DeviceInstancesService} from '../../../devices/device-instances/shared/device-instances.service';
import {DeviceInstancesModel} from '../../../devices/device-instances/shared/device-instances.model';
import {DeviceTypeService} from '../../../devices/device-types/shared/device-type.service';
import {DeviceTypeModel, DeviceTypeServiceModel} from '../../../devices/device-types/shared/device-type.model';
import {ExportModel, ExportValueModel} from '../shared/export.model';
import {ExportService} from '../shared/export.service';
import {MatSnackBar} from '@angular/material';


@Component({
    selector: 'senergy-new-export',
    templateUrl: './new-export.component.html',
    styleUrls: ['./new-export.component.css']
})

export class NewExportComponent implements OnInit {

    ready = false;
    export = {} as ExportModel;
    selector = 'device';
    service = {} as DeviceTypeServiceModel;
    device = {} as DeviceInstancesModel;
    deviceType = {} as DeviceTypeModel;
    pipeline = {} as PipelineModel;
    operator = {} as PipelineOperatorModel;
    devices: DeviceInstancesModel [] = [];
    pipelines: PipelineModel [] = [];

    dropdown = [
        'float',
        'string',
        'int'
    ];


    constructor(private pipelineRegistryService: PipelineRegistryService,
                private deviceInstanceService: DeviceInstancesService,
                private deviceTypeService: DeviceTypeService,
                private exportService: ExportService,
                public snackBar: MatSnackBar) {
    }

    ngOnInit() {
        this.loadDevices();
        this.loadPipelines();
    }

    startExport() {
        if (this.selector === 'device') {
            this.export.EntityName = this.device.name;
            this.export.Filter = this.device.id;
            this.export.FilterType = 'deviceId';
            this.export.ServiceName = this.service.name;
            this.export.Topic = this.service.id.replace(/#/g, '_');
        } else if (this.selector === 'pipe') {
            this.export.EntityName = this.pipeline.id;
            this.export.Filter = this.pipeline.id;
            this.export.FilterType = 'pipeId';
            this.export.ServiceName = this.operator.Name;
            this.export.Topic = 'analytics-' + this.operator.Name;
        }
        this.exportService.startPipeline(this.export).subscribe();
        this.snackBar.open('Export created', undefined, {
            duration: 2000,
        });
    }

    deviceChanged(device: DeviceInstancesModel) {
        if (this.device !== device) {
            this.deviceTypeService.getDeviceType(device.devicetype).subscribe((resp: DeviceTypeModel | null) => {
                if (resp !== null) {
                    this.deviceType = resp;
                }
            });
        }
    }

    addValue() {
        if (this.export.Values === undefined) {
            this.export.Values = [];
        }
        this.export.Values.push({} as ExportValueModel);
    }

    deleteValue(value: ExportValueModel) {
        if (this.export.Values !== undefined) {
            const index = this.export.Values.indexOf(value);
            if (index > -1) {
                this.export.Values.splice(index, 1);
            }
        }
    }

    loadPipelines() {
        this.pipelineRegistryService.getPipelines().subscribe((resp: PipelineModel[]) => {
            this.pipelines = resp;
        });
    }

    loadDevices() {
        this.deviceInstanceService.getDeviceInstances('', 50, 0, 'name', 'asc').subscribe((resp: DeviceInstancesModel []) => {
            this.devices = resp;
        });
    }
}