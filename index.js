import Map from "@arcgis/core/Map.js";
import MapView from "@arcgis/core/views/MapView.js";
import esriConfig from "@arcgis/core/config.js";
import Point from "@arcgis/core/geometry/Point.js";
import Graphic from "@arcgis/core/Graphic.js";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer.js";
import Home from "@arcgis/core/widgets/Home.js";
import mapImage from './assets/map.png';
import crossImage from './assets/cross.svg';

export class Widget {   
    constructor({ apiKey = '', position = 'bottom-right', button = false} = {}) {
        esriConfig.apiKey = apiKey;
        this.position = this.getPosition(position);
        this.classPosition = position;
        this.button = button;
        this.view = {};
        this.map = {};
        this.graphicsLayer = {};
        this.open = false;
        this.initialise();
        this.createStyles();
    }
   
    getPosition(position) {
        const [vertical, horizontal] = position.split('-');  
        return {
            [vertical]: '30px',
            [horizontal]: '30px',
        };   
    }
    
    initialise() {
        const container = document.createElement('div');
        container.style.position = 'fixed';
        Object.keys(this.position)
            .forEach(key => container.style[key] = this.position[key]);
        document.body.appendChild(container);

        this.messageContainer = document.createElement('div');
        this.messageContainer.classList.add('message-container', `${this.classPosition}`);
        this.createMessageContainerContent();

        if(this.button){
            const buttonContainer = document.createElement('div');
            buttonContainer.classList.add('button-container');

            const chatIcon = document.createElement('img');
            chatIcon.src = mapImage;
            chatIcon.classList.add('icon');
            this.chatIcon = chatIcon;
    
            const closeIcon = document.createElement('img');
            closeIcon.src = crossImage;
            closeIcon.classList.add('icon', 'hidden');
            this.closeIcon = closeIcon;

            this.messageContainer.classList.add('hidden', 'button-true');

            buttonContainer.appendChild(this.chatIcon);
            buttonContainer.appendChild(this.closeIcon);

            buttonContainer.addEventListener('click', this.toggleOpen.bind(this));
            container.appendChild(buttonContainer);
        }
        container.appendChild(this.messageContainer);
    }

    createStyles() {
        const link = document.createElement('link');
        link.rel = "stylesheet";
        link.href = "https://js.arcgis.com/4.25/esri/themes/light/main.css";
        document.head.appendChild(link);

        const styleTag = document.createElement('style');
        document.head.appendChild(styleTag);

        styleTag.innerHTML = `
        .icon {
            cursor: pointer;
            width: 70%;
            position: absolute;
            top: 8px;
            left: 8px;
            transition: transform .3s ease;
        }
        .hidden {
            transform: scale(0);
        }
        .button-container {
            background-color: #2F2CD3;
            width: 55px;
            height: 55px;
            border-radius: 50%;
        }
        .message-container {
            box-shadow: 0 0 18px 8px rgba(0, 0, 0, 0.1), 0 0 32px 32px rgba(0, 0, 0, 0.08);
            width: 400px;
            height: auto;
            right: -25px;
            bottom: 75px;
            max-height: 400px;
            font-family: Helvetica, Arial ,sans-serif;
            background-color: #fff;
        }

        .button-true{
            position: absolute;
            transition: max-height .2s ease;
        }

        .bottom-left {
            left: -25px;
        }

        .top-right {
            top: 75px;
        }

        .top-left {
            top: 75px;
            left: -25px;
        }

        .message-container.hidden {
            max-height: 0px;
        }

        .message-container .search {
            margin: 0;
            padding: 10px 10px;
            color: #fff;
            background-color: #ACB0F3;
        }
        .message-container .content {
            margin: 10px 10px ;
            border: 1px solid #dbdbdb;
            padding: 6px;
            display: flex;
            background-color: #fff;
            flex-direction: column;
            height: 290px;
            max-height: 290px;
        }
        .view-div {
            height: 100%;
            width: 100%;
        }
        .message-container form input {
            padding: 7px;
            border: none;
            width: 70%;
        }

        .message-container form button {
            cursor: pointer;
            background-color: #2F2CD3;
            color: #fff;
            border: 0;
            border-radius: 4px;
            padding: 7px;
            margin-left: 20px;
        }
        .message-container form button:hover {
            background-color: #242DB9;
        }
        `;
    };

    createMessageContainerContent() {

        const form = document.createElement('form');
        form.className = 'search'

        const point = document.createElement('input');
        point.required = true;
        point.id = 'point';
        point.placeholder = 'Enter an address';
        form.appendChild(point)

        const btn = document.createElement('button');
        btn.textContent = 'Submit';
        form.addEventListener('submit', this.submit.bind(this));
        point.addEventListener('keypress', function(event) {
            if (event.key === "Enter") {
                this.submit;
                return false;
            }
        });
        form.appendChild(btn)

        const mapContainer = document.createElement('div');
        mapContainer.classList.add('content');

        const viewDiv = document.createElement('div');
        viewDiv.id = 'viewDiv';
        viewDiv.classList.add('view-div');

        mapContainer.appendChild(viewDiv);

        this.messageContainer.appendChild(form);
        this.messageContainer.appendChild(mapContainer);

        window.addEventListener('load', ()=>this.createMap())
    };

    async createMap() {
        const map = new Map({
            basemap: "arcgis-navigation",
        });
        this.map = map;

        const view = new MapView({
            map: map,
            container: "viewDiv",
            center: [-70.619641, -33.486599],    
            zoom: 6
        }); 

        this.view = view;

        const homeBtn = new Home({
            view: view
        });

        view.ui.add(homeBtn, "top-right");

        view.on("click", (event) => {
            this.getClickedObject(event)
        });
    }

    async eventHandler() {
        return window.addEventListener('load', async () => {
            return this.view.on("click", async (event) => {
                return await this.getClickedObject(event)
            })

        })
    }
    
    toggleOpen() {
        this.open = !this.open;
        if(this.open) {
            this.chatIcon.classList.add('hidden');
            this.closeIcon.classList.remove('hidden');
            this.messageContainer.classList.remove('hidden');
            window.onload = this.createMap();
        }else {
            this.chatIcon.classList.remove('hidden');
            this.closeIcon.classList.add('hidden');
            this.messageContainer.classList.add('hidden');
        }
    };

    async getClickedObject(event){
        try{
            const coords = [event.mapPoint.latitude, event.mapPoint.longitude];
            const obj = await this.fetchByGeo(coords);
            if(obj===undefined){
                console.info(`Cannot find ${coords}`);
                return
            }
            console.log(obj[0]) 
            return obj[0]
        }catch(err){
            console.error(err)
        }
    }

    submit(event) {
        event.preventDefault();
        let direction = event.srcElement.querySelector('#point').value
        event.srcElement.querySelector('#point').value = '';
        if(direction.startsWith('[')){
            direction = JSON.parse(direction);
            this.goToPosition(direction);
        }else {
            this.fetchByDescription(direction)
        }
    } 

    async fetchByDescription(direction) {
        try {
            const res = await fetch(`https://search.xygo.com/search/findDescription?q=${direction}`);
            const json = await res.json();
            const ubication = Object.values(json.Resultados[0])[10];
            const {lat, lon} = ubication;
            this.goToPosition([lon, lat])
        } catch (err) {
            console.error(err.message);
        }
    };

    async fetchByGeo(coords) {
        try {
            const res = await fetch(`https://search.xygo.com/search/findGeoInversa?lat=${coords[0]}&lon=${coords[1]}`);
            const json = await res.json();
            return json;
        } catch (err) {
        }
    };

    goToPosition(coordinates){
        let point;

        if(Object.keys(this.graphicsLayer).length !== 0){
            this.graphicsLayer.removeAll();
        }

        point = new Point(coordinates);

        this.view.goTo({
            target: point,
            zoom: 14
        }, {duration: 1000})
        .catch(function(error) {
            if (error.name != "AbortError") {
                console.error(error);
            }
        }); 
        
        const graphicsLayer = new GraphicsLayer();
        this.graphicsLayer = graphicsLayer;
        
        this.map.add(graphicsLayer);
         
        const simpleMarkerSymbol = {
            type: "simple-marker",
            color: [0, 0, 255],
            outline: {
                color: [255, 255, 255],
                width: 1
            }
        };

        const pointGraphic = new Graphic({
            geometry: point,
            symbol: simpleMarkerSymbol
        });

        this.pointGraphic = pointGraphic;
        graphicsLayer.add(pointGraphic);            
    };
};


   

    
