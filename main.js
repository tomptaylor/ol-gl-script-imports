//import './ol/css'
//import 'ol/ol.css';
import MVT from 'ol/format/MVT'
import Layer from 'ol/layer/Layer';
import Map from 'ol/Map';
import Source from 'ol/source/Source';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import View from 'ol/View';
import {
  Stroke,
  Style
} from 'ol/style';
import {
  fromLonLat,
  toLonLat
} from 'ol/proj';

const center = [-98.8, 37.9];

const mbMap = new mapboxgl.Map({
  style: 'http://localhost:3650/api/maps/basic/style.json',
  attributionControl: false,
  boxZoom: false,
  center: center,
  container: 'map',
  doubleClickZoom: false,
  dragPan: false,
  dragRotate: false,
  interactive: false,
  keyboard: false,
  pitchWithRotate: false,
  scrollZoom: false,
  touchZoomRotate: false,
});

const mbLayer = new Layer({
  render: function (frameState) {
    const canvas = mbMap.getCanvas();
    const viewState = frameState.viewState;

    const visible = mbLayer.getVisible();
    canvas.style.display = visible ? 'block' : 'none';

    const opacity = mbLayer.getOpacity();
    canvas.style.opacity = opacity;

    // adjust view parameters in mapbox
    const rotation = viewState.rotation;
    mbMap.jumpTo({
      center: toLonLat(viewState.center),
      zoom: viewState.zoom - 1,
      bearing: (-rotation * 180) / Math.PI,
      animate: false,
    });

    // cancel the scheduled update & trigger synchronous redraw
    // see https://github.com/mapbox/mapbox-gl-js/issues/7893#issue-408992184
    // NOTE: THIS MIGHT BREAK IF UPDATING THE MAPBOX VERSION
    if (mbMap._frame) {
      mbMap._frame.cancel();
      mbMap._frame = null;
    }
    mbMap._render();

    return canvas;
  },
  source: new Source({
    attributions: [
      '<a href="https://www.maptiler.com/copyright/" target="_blank">© MapTiler</a>',
      '<a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap contributors</a>',
    ],
  }),
});

const style = new Style({
  stroke: new Stroke({
    color: '#319FD3',
    width: 2,
  }),
});

var tileURL = 'http://localhost:3650/api/tiles/maptiler-osm/{z}/{x}/{y}';

const vectorLayer = new VectorLayer({
  source: new VectorSource({
    format: new MVT(),
    url: tileURL,
  }),
  style: style,
});

const map = new Map({
  target: 'map',
  view: new View({
    center: fromLonLat(center),
    zoom: 4,
  }),
  layers: [mbLayer, vectorLayer],
});