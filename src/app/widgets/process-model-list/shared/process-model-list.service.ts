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

import {Injectable} from '@angular/core';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {DashboardService} from '../../../modules/dashboard/shared/dashboard.service';
import {ProcessModelListEditDialogComponent} from '../dialogs/process-model-list-edit-dialog.component';
import {WidgetModel} from '../../../modules/dashboard/shared/dashboard-widget.model';
import {DashboardManipulationEnum} from '../../../modules/dashboard/shared/dashboard-manipulation.enum';
import {Observable} from 'rxjs';
import {StartProcessModel} from '../../../modules/start/shared/start-process.model';
import {PermissionsProcessModel} from '../../../modules/permissions/shared/permissions-process.model';
import {PermissionsService} from '../../../modules/permissions/shared/permissions.service';
import {ProcessModelListModel} from './process-model-list.model';


@Injectable({
    providedIn: 'root'
})
export class ProcessModelListService {

    constructor(private dialog: MatDialog,
                private dashboardService: DashboardService,
                private permissionsService: PermissionsService,) {
    }

    openEditDialog(dashboardId: string, widgetId: string): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = false;
        dialogConfig.data = {
            widgetId: widgetId,
            dashboardId: dashboardId,
        };
        const editDialogRef = this.dialog.open(ProcessModelListEditDialogComponent, dialogConfig);

        editDialogRef.afterClosed().subscribe((widget: WidgetModel) => {
            if (widget !== undefined) {
                this.dashboardService.manipulateWidget(DashboardManipulationEnum.Update, widget.id, widget);
            }
        });
    }

    getProcesses(): Observable<ProcessModelListModel[]> {
        return new Observable<StartProcessModel[]>((observer) => {
            this.permissionsService.getProcessModels('', 10, 0, 'date', 'desc').subscribe((processes: PermissionsProcessModel[]) => {
                observer.next(this.prettifyProcessData(processes));
                observer.complete();
            });
        });
    }

    private prettifyProcessData(processes: PermissionsProcessModel[]): ProcessModelListModel[] {
        const processesArray: ProcessModelListModel[] = [];
        if (processes !== null) {
            processes.forEach(process => {
                processesArray.push(new ProcessModelListModel(process.name, process.id, new Date(process.date)));
            });
        }
        return processesArray;
    }
}

