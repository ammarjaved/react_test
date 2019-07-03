import * as React from "react";
import {Col, Card, CardHeader, CardBody} from 'reactstrap';
import {Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem, NavLink} from 'reactstrap';
import axios from 'axios'
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import {transform} from 'ol/proj';
import Popup from 'ol-popup/src/ol-popup';
import {getCenter} from 'ol/extent.js';
import {defaults as defaultControls, ZoomToExtent} from 'ol/control.js';
import TileLayer from 'ol/layer/Tile.js';
import OSM from 'ol/source/OSM.js';
import LayerSwitcher from "ol-layerswitcher/src/ol-layerswitcher.js";
import Stamen from "ol/source/Stamen.js";
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import {Fill, Stroke, Style, Text} from 'ol/style.js';
import BingMaps from 'ol/source/BingMaps.js';
import $ from 'jquery';
import Geocoder from 'ol-geocoder/dist/ol-geocoder';


require('ol-geocoder/dist/ol-geocoder.min.css');
require('ol-popup/src/ol-popup.css');



class Map2D extends React.Component {
    view = null;
    map = null;
    ol3d = null;

    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            enable3D: false
        };
        this.toggleNavbar = this.toggleNavbar.bind(this);
        this.toggle3D = this.toggle3D.bind(this);

    }

    toggleNavbar() {
        this.setState({
            isOpen: !this.state.isOpen,
        });
    }

    toggle3D() {
        this.setState({
            enable3D: !this.state.enable3D
        })
        this.ol3d.setEnabled(this.state.enable3D);
    }


    componentDidMount() {
        const bingMapKey = 'nIpvP3DE4KDIPD5rbvf8~tYqmHfqtK9FrpulnwqB6Ow~AlfsQeqqd1RiQqE5rzdQnrgwjgawr26TNXWuLLIrlyMRj2JEp_IhUATReKhb4rCt';
        this.view = new View({
            center: getCenter(this.props.extent),
            extent: this.props.extent,
            zoom: 5
        });
        this.map = new Map({
            controls: defaultControls().extend([
                new ZoomToExtent({
                    extent: this.props.extent,
                }),
                new LayerSwitcher({
                    tipLabel: 'Legend' // Optional label for button
                })
            ]),
            layers: [
                new TileLayer({
                    title: 'Bing Map',
                    preload: Infinity,
                    type: 'base',
                    visible: true,
                    source: new BingMaps({
                        key: bingMapKey,
                        imagerySet: 'AerialWithLabels',
                        // use maxZoom 19 to see stretched tiles instead of the BingMaps
                        // "no photos at this zoom level" tiles
                        // maxZoom: 19

                    })
                }),
                new TileLayer({
                    title: 'OSM',
                    type: 'base',
                    visible: false,
                    source: new OSM()
                }),
                new VectorLayer({
                    title: "Weather Info layer",
                    source: new VectorSource({
                        features: []
                    }),
                    style: new Style({
                        stroke: new Stroke({
                            color: '#aa000b',
                            width: 1
                        }),
                        fill: new Fill({
                            color: 'rgba(255,0,0,0.3)'
                        }),
                    })
                })
            ],
            target: 'map',
            view: this.view
        });
        this.geocoder = new Geocoder('nominatim', {
            provider: 'osm',
            lang: 'en',
            placeholder: 'Search for ...',
            limit: 5,
            debug: false,
            autoComplete: true,
            keepOpen: true
        });
        this.map.addControl(this.geocoder);
        let popup = new Popup();
        this.map.addOverlay(popup);
        this.geocoder.on('addresschosen', function (evt) {
            window.setTimeout(function () {
                // geocoder.getLayer().getSource().clear();
                let pnt = transform([evt.coordinate[0], evt.coordinate[1]], 'EPSG:3857', 'EPSG:4326');
                getWeatherData(pnt[1], pnt[0], evt);
            }, 3000);
        });

        function getWeatherData(lat, long, evt) {
            axios.get('http://api.openweathermap.org/data/2.5/weather?lat=' + lat + '&lon=' + long + '&units=metric&APPID=8aaba049f13af03ca4ad9c10672b391a')
                .then(response => createTable(response,evt))
        }


        function createTable(b,evt){
            let table = '<table class="table table-striped">';
            var d=b.data;
            for (let k in d) {
                if (k === 'weather') {
                    console.log(k)
                    let tr = '<tr><td>Weather</td><td>' + d[k][0].description + '</td></tr>';
                    table = table + tr;
                }
                if (k === 'main') {
                    for (let key in d[k]) {
                        let tr = '<tr><td>' + key + '</td>';
                        if (key.indexOf("temp") !== -1) {
                            tr = tr + '<td>' + d[k][key] + ' &deg;C</td></tr>';

                        } else {
                            tr = tr + '<td>' + d[k][key] + '</td></tr>';
                        }
                        table = table + tr;
                    }

                }
                if (k === 'wind') {
                    let tr = '<tr><td>Wind Speed</td><td>' + d[k].speed + ' m/s</td></tr>';
                    table = table + tr;
                }
            }
            table = table + '</table>';
            popup.show(evt.coordinate, table);
        }



    }

    render() {
        const mapStyle = {
            width: '100%',
            height: '100%',
        };
        const cardBodyStyle = {
            padding: '1px'
        }
        return (
            <Col sm="12">
                <Card>
                    <CardBody style={cardBodyStyle}>
                        <Navbar color="light" expand="md" style={{padding: '0px'}}>
                            <NavbarBrand style={{paddingLeft: "15px", color: '#ffffff'}}>Map</NavbarBrand>
                            <NavbarToggler onClick={this.toggleNavbar} className="ml-auto"/>
                            <Collapse isOpen={this.state.isOpen} navbar>
                            </Collapse>
                        </Navbar>

                    </CardBody>
                    <CardBody style={cardBodyStyle}>
                        <div id="map" style={mapStyle}></div>
                    </CardBody>
                </Card>
            </Col>
        );
    }
};
export default Map2D;