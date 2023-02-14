import {ProspectingMap} from "./ProspectingMap.js";
import {MapParams} from "./MapParams.js";
import {OreSelector} from "./OreSelector.js";
import {UrlUpdater} from "./UrlUpdater.js";
import {CoordinateUpdater} from "./CoordinateUpdater.js";
import {LoginForm} from "./LoginForm.js";
import {SampleForm} from "./SampleForm.js";


const mapConfigFile = await fetch('/js/mapconfig.json');
const mapConfig = await mapConfigFile.json();

const mapParams = new MapParams(mapConfig);

const canvas = document.querySelector('#map')
const map = new ProspectingMap(canvas, mapConfig);
map.setPosition(mapParams.x(), mapParams.y());
map.setScale(mapParams.scale());
map.setOre(mapParams.ore());
map.draw();

const oreSelector = new OreSelector(map, document.querySelector('#shownOre'));
oreSelector.setOre(mapParams.ore());

new UrlUpdater(map);
new CoordinateUpdater(map, document.querySelector('.coords'));

const loginForm = document.querySelector('#login');
if (loginForm) {
    new LoginForm(loginForm);
}

const sampleForm = document.querySelector('#newSample');
if (sampleForm) {
    const oreForm = document.querySelector('#addOre');
    const oreTemplate = document.querySelector('#newOreTemplate');
    new SampleForm(sampleForm, oreForm, oreTemplate, map);
}