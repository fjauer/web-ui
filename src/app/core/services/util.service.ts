/*
 * Copyright 2019 InfAI (CC SES)
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
import * as X2JS from 'x2js';

@Injectable({
    providedIn: 'root'
})


export class UtilService {

    x2js: any;

    constructor() {
        this.x2js = new X2JS();
    }

    convertJSONtoSVG(svg: string):string {
        return this.x2js.js2xml(svg);
    }

    convertSVGtoBase64(svg: string): string {
        return window.btoa(svg);
    }

}