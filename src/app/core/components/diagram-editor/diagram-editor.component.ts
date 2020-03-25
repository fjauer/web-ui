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

import {AfterViewInit, Component, OnInit} from '@angular/core';
import {dia, shapes, util} from 'jointjs';
import * as $ from 'jquery';
import {DiagramModel} from './shared/diagram.model';
import uuid = util.uuid;

@Component({
    selector: 'senergy-diagram-editor',
    templateUrl: './diagram-editor.component.html',
    styleUrls: ['./diagram-editor.component.css']
})

export class DiagramEditorComponent implements AfterViewInit {

    private graph: any;

    idGenerated = uuid();

    NodeElement: any = dia.Element.define('senergy.NodeElement',
        {
            inPorts: [],
            outPorts: [],
            name: '',
            image: '',
            operatorId: '',
            size: {
                width: 150,
                height: 100
            },
            attrs: {
                '.': {
                    magnet: false
                },
                body: {
                    refWidth: '100%',
                    refHeight: '100%',
                    strokeWidth: 2,
                    stroke: 'black',
                    fill: 'white'
                },
                label: {
                    textVerticalAnchor: 'middle',
                    textAnchor: 'middle',
                    refX: '50%',
                    refY: '50%',
                    fontSize: 14,
                    fill: 'black'
                },
                button: {
                    cursor: 'pointer',
                    ref: 'buttonLabel',
                    refWidth: '150%',
                    refHeight: '150%',
                    refX: '-25%',
                    refY: '-25%'
                },
                buttonLabel: {
                    pointerEvents: 'none',
                    refX: '100%',
                    refY: 0,
                    textAnchor: 'middle',
                    textVerticalAnchor: 'middle'
                }
            },
            ports: {
                groups: {
                    'in': {
                        position: {
                            name: 'left'
                        },
                        attrs: {
                            portLabel: {
                                fill: '#000'
                            },
                            portBody: {
                                fill: '#fff',
                                stroke: '#000',
                                r: 10,
                                magnet: true
                            }
                        },
                        label: {
                            position: {
                                name: 'left',
                                args: {
                                    y: 10
                                }
                            }
                        }
                    },
                    'out': {
                        position: {
                            name: 'right'
                        },
                        attrs: {
                            portLabel: {
                                fill: '#000'
                            },
                            portBody: {
                                fill: '#fff',
                                stroke: '#000',
                                r: 10,
                                magnet: true
                            }
                        },
                        label: {
                            position: {
                                name: 'right',
                                args: {
                                    y: 10
                                }
                            }
                        }
                    }
                }
            }
        }, {
            markup: [{
                tagName: 'rect',
                selector: 'body',
            }, {
                tagName: 'text',
                selector: 'label'
            }, {
                tagName: 'rect',
                selector: 'button'
            }, {
                tagName: 'text',
                selector: 'buttonLabel'
            }],
            portMarkup: [{
                tagName: 'circle',
                selector: 'portBody',
            }],
            portLabelMarkup: [{
                tagName: 'text',
                selector: 'portLabel',
            }],

            initialize: function () {
                shapes.basic.Generic.prototype.initialize.apply(this, <any>arguments);
                this.updatePortItems();
            },

            // model,changed
            updatePortItems: function () {
                // Make sure all ports are unique.
                const inPorts = util.uniq(this.get('inPorts'));
                const outPorts = util.uniq(this.get('outPorts'));

                const inPortItems = this.createPortItems('in', inPorts);
                const outPortItems = this.createPortItems('out', outPorts);

                this.prop('ports/items', inPortItems.concat(outPortItems));
            },

            createPortItem: function (group: any, port: any) {

                return {
                    id: group + '-' + port,
                    group: group,
                    attrs: {
                        portLabel: {
                            text: port
                        }
                    }
                };
            },

            createPortItems: function (group: any, ports: any) {

                return util.toArray(ports).map(this.createPortItem.bind(this, group));
            }
        }
    );

    paperWidth = 500;
    paper!: any;

    constructor() {
    }

    ngAfterViewInit() {
            this.setPaperWidth();
            this.reinitializePaper();
            this.paper.on('element:button:pointerdown', (elementView: any, evt: any) => {
                evt.stopPropagation(); // stop any further actions with the element view (e.g. dragging)
                const model = elementView.model;
                model.remove();
            });
    }

    onResize({}) {
        this.setPaperWidth();
        this.paper.setDimensions(this.paperWidth, 700);
    }

    setPaperWidth() {
        const paperWrap = document.getElementById('paper-wrap');
        if (paperWrap !== null) {

            this.paperWidth = paperWrap.offsetWidth;
        }
    }

    reinitializePaper() {
        const { standard, devs } = shapes;
        this.graph = new dia.Graph({}, {
            cellNamespace: {
                standard,
                devs,
                senergy: { NodeElement: this.NodeElement }
            } });
        this.paper = new dia.Paper({
            el: $('#' + this.idGenerated),
            model: this.graph,
            defaultLink: new dia.Link({
                attrs: {'.marker-target': {d: 'M 10 0 L 0 5 L 10 10 z'}}
            }),
            width: this.paperWidth,
            height: 700,
            gridSize: 20,
            linkPinning: true,
            snapLinks: true,
            drawGrid: {name: 'mesh'},
            embeddingMode: false,
            validateConnection: function (sourceView, sourceMagnet, targetView, targetMagnet) {
                // Prevent linking from input ports.
                if (sourceMagnet && sourceMagnet.getAttribute('port-group') === 'in') {
                    return false;
                }
                if (sourceView === targetView) {
                    return false;
                }
                return targetMagnet && targetMagnet.getAttribute('port-group') === 'in';
            },
            markAvailable: true
        });
    }

    public loadGraph(model: DiagramModel) {
        this.graph.fromJSON(model);
    }

    public getGraph(): DiagramModel {
        return this.graph.toJSON();
    }

    public newCloudNode(name: string, image: string, inputs: any[], outputs: any[], config: any[], operatorId: string): any {
        const node = this.newNode(name, image, inputs, outputs, config, operatorId);
        node.attributes.deploymentType = 'cloud';
        node.attr({
            body: {
                fill: '#4484ce',
            }
        });
        this.graph.addCells([node]);
        this.graph.maxZIndex();
        return node;
    }

    public newLocalNode(name: string, image: string, inputs: any[], outputs: any[], config: any[], operatorId: string): any {
        const node = this.newNode(name, image, inputs, outputs, config, operatorId);
        node.attributes.deploymentType = 'local';
        node.attr({
            body: {
                fill: '#ddd',
            }
        });
        this.graph.addCells([node]);
        this.graph.maxZIndex();
        return node;
    }

    public newNode(name: string, image: string, inputs: any[], outputs: any[], config: any[], operatorId: string): any {
        const inPorts = [];
        if (inputs !== null) {
            for (const input of inputs) {
                if (input.name !== undefined) {
                    inPorts.push(input.name);
                }
            }
        }

        const outPorts = [];
        if (outputs !== null) {
            for (const output of outputs) {
                if (output.name !== undefined) {
                    outPorts.push(output.name);
                }
            }
        }
        const node = new this.NodeElement({
            type: 'senergy.NodeElement',
            inPorts: inPorts,
            outPorts: outPorts,
            name: name,
            image: image,
            config: config,
            operatorId: operatorId
        });
        node.position(150, 50);
        node.attr({
            label: {
                pointerEvents: 'none',
                visibility: 'visible',
                text: name
            },
            body: {
                cursor: 'default',
                visibility: 'visible'
            },
            button: {
                event: 'element:button:pointerdown',
                fill: 'orange',
                stroke: 'black',
                strokeWidth: 2
            },
            buttonLabel: {
                text: 'X', // fullwidth underscore
                fill: 'black',
                fontSize: 8,
                fontWeight: 'bold'
            }
        });
        return node;
    }


}
