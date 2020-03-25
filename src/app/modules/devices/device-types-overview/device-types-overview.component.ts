/*
 * Copyright 2020 InfAI (CC SES)
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

import {Component, OnDestroy, OnInit} from '@angular/core';
import {SortModel} from '../../../core/components/sort/shared/sort.model';
import {Subscription} from 'rxjs';
import {SearchbarService} from '../../../core/components/searchbar/shared/searchbar.service';
import {ResponsiveService} from '../../../core/services/responsive.service';
import {DeviceTypeService} from './shared/device-type.service';
import {DeviceTypePermSearchModel} from './shared/device-type-perm-search.model';
import {MatSnackBar} from '@angular/material/snack-bar';
import {DeviceInstancesService} from '../device-instances/shared/device-instances.service';
import {DialogsService} from '../../../core/services/dialogs.service';
import {Router} from '@angular/router';

const grids = new Map([
    ['xs', 1],
    ['sm', 3],
    ['md', 3],
    ['lg', 4],
    ['xl', 6],
]);


@Component({
    selector: 'senergy-device-types',
    templateUrl: './device-types-overview.component.html',
    styleUrls: ['./device-types-overview.component.css']
})
export class DeviceTypesOverviewComponent implements OnInit, OnDestroy {

    deviceTypes: DeviceTypePermSearchModel[] = [];
    gridCols = 0;
    ready = false;
    sortAttributes = new Array(new SortModel('Name', 'name', 'asc'));

    private searchText = '';
    private limit = 54;
    private offset = 0;
    private sortAttribute = this.sortAttributes[0];
    private searchSub: Subscription = new Subscription();
    private allDataLoaded = false;

    constructor(private searchbarService: SearchbarService,
                private responsiveService: ResponsiveService,
                private deviceTypeService: DeviceTypeService,
                private snackBar: MatSnackBar,
                private deviceInstancesService: DeviceInstancesService,
                private dialogsService: DialogsService,
                private router: Router) {
    }

    ngOnInit() {
        this.initGridCols();
        this.initSearchAndGetDeviceTypes();
    }

    ngOnDestroy() {
        this.searchSub.unsubscribe();
    }

    receiveSortingAttribute(sortAttribute: SortModel) {
        this.reset();
        this.sortAttribute = sortAttribute;
        this.getDeviceTypes();
    }

    onScroll() {
        if (!this.allDataLoaded && this.ready) {
            this.ready = false;
            this.offset = this.offset + this.limit;
            this.getDeviceTypes();
        }
    }

    delete(deviceTypeInput: DeviceTypePermSearchModel) {
        this.dialogsService.openDeleteDialog('device type: ' + deviceTypeInput.name).afterClosed().subscribe((deviceTypeDelete: boolean) => {
            if (deviceTypeDelete) {
                this.deviceTypeService.deleteDeviceType(encodeURIComponent(deviceTypeInput.id)).subscribe((deleted: boolean) => {
                    if (deleted) {
                        const index = this.deviceTypes.indexOf(deviceTypeInput);
                        this.deviceTypes.splice(index, 1);
                        this.snackBar.open('Device type deleted successfully.', '', {duration: 2000});

                    } else {
                        this.snackBar.open('Error while deleting device type!', '', {duration: 2000});
                    }
                });
            }
        });
    }

    copyDeviceType(deviceTypeId: string): void {
        this.router.navigate(['devices/devicetypesoverview/devicetypes/' + deviceTypeId], {
            queryParams: {function: 'copy'},
        });
    }

    editDeviceType(deviceTypeId: string): void {
        this.router.navigate(['devices/devicetypesoverview/devicetypes/' + deviceTypeId], {
            queryParams: {function: 'edit'},
        });
    }

    detailsDeviceType(deviceTypeId: string): void {
        this.router.navigate(['devices/devicetypesoverview/devicetypes/' + deviceTypeId], {
            queryParams: {function: 'details'},
        });
    }

    createDeviceType(): void {
        this.router.navigate(['devices/devicetypesoverview/devicetypes'], {
            queryParams: {function: 'create'},
        });
    }

    newInstance(deviceType: DeviceTypePermSearchModel): void {
        this.deviceInstancesService.openDeviceCreateDialog(deviceType);
    }

    private initSearchAndGetDeviceTypes() {
        this.searchSub = this.searchbarService.currentSearchText.subscribe((searchText: string) => {
            this.reset();
            this.searchText = searchText;
            this.getDeviceTypes();
        });
    }

    private getDeviceTypes() {
        this.deviceTypeService.getDeviceTypes(this.searchText, this.limit, this.offset, this.sortAttribute.value,
            this.sortAttribute.order).subscribe(
            (deviceTypes: DeviceTypePermSearchModel[]) => {
                if (deviceTypes.length !== this.limit) {
                    this.allDataLoaded = true;
                }
                this.deviceTypes = this.deviceTypes.concat(deviceTypes);
                this.ready = true;
            });
    }

    private initGridCols(): void {
        this.gridCols = grids.get(this.responsiveService.getActiveMqAlias()) || 0;
        this.responsiveService.observeMqAlias().subscribe((mqAlias) => {
            this.gridCols = grids.get(mqAlias) || 0;
        });
    }

    private reset() {
        this.deviceTypes = [];
        this.offset = 0;
        this.allDataLoaded = false;
        this.ready = false;
    }

}
