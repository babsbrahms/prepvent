import React from 'react';
import {GoogleApiWrapper} from "google-maps-react";
import PropTypes from "prop-types";

// YOU NEED REACT / REACT-DOM 15.6.1 BECAUSE YOU CANNOT GET REF OR DOMNODE IN VERSEION 16
class MapContainer extends React.Component {

    constructor (props) {
        super(props)
        this.map = null;
        this.marker = null;
    }   

    componentDidMount(){
        this.getMap()
    }

    // componentWillUnmount() {
    //     this.map.removeListener('click', () => {
    //         this.marker.setPosition(null)
    //     });
    // }
    
  
    UNSAFE_componentWillReceiveProps(nextProp){
        // call a function that will update location
        if (nextProp.eventLocation && nextProp.eventLocation.lat ) {
            this.updatedDest(nextProp.eventLocation)
        }
        
    }


    placeMarkerAndPanTo = (latLng) => {
        const {  newPosition } = this.props;
        this.map.setCenter(latLng)
        this.marker.setPosition(latLng); 
        // let position = this.marker.getPosition()
        newPosition(latLng.toJSON())
    }
    
    getMap =() =>{
        const { eventLocation, google } = this.props;
        if (this.props && google) { 
            
            const maps = google.maps;
            
      
            const mapRef = this.mapDiv 
            // const node = ReactDOM.findDOMNode(mapRef);

            const mapOptions ={
                zoom: 7,
                mapTypeId: "roadmap",
                //center: {lat: -34.397, lng: 150.644}
            }
            
            this.map = new maps.Map(mapRef, mapOptions);

            this.marker = new maps.Marker({
                map: this.map,
                title: 'current location'
            });

            this.map.addListener('click', (e) => {
                if (this.props.pickPosition) {
                    this.placeMarkerAndPanTo(e.latLng)
                }
            });

            if (eventLocation && eventLocation.lat ) {
                this.map.setCenter(new google.maps.LatLng(eventLocation.lat, eventLocation.lng))

                this.marker.setPosition(new google.maps.LatLng(eventLocation.lat, eventLocation.lng)); 

                const iconwindow = new google.maps.InfoWindow({
                    content: "Event Location"
                });
    
                this.marker.addListener('click',()=>{
                    iconwindow.open(this.map, this.marker)
                })
            } else {
                if(navigator.geolocation){
              
                    navigator.geolocation.getCurrentPosition((position)=> {
                        const lat = position.coords.latitude;
                        const lng = position.coords.longitude;
    
                        this.map.setCenter(new google.maps.LatLng(lat, lng ))
                        this.marker.setPosition(new google.maps.LatLng(lat, lng )); 
                        
                    },()=>{
                        this.map.setCenter(new google.maps.LatLng(6.5243793, 3.3792057))

                        this.marker.setPosition(new google.maps.LatLng(6.5243793, 3.3792057)); 
    
                    },{enableHighAccuracy: true})
                }else{
                    this.map.setCenter(new google.maps.LatLng(6.5243793, 3.3792057))

                    this.marker.setPosition(new google.maps.LatLng(6.5243793, 3.3792057)); 
                }

            }
   
        }
    }


    updatedDest = eventLocation =>{
        const { google } = this.props;
        this.map.setCenter(new google.maps.LatLng(eventLocation.lat, eventLocation.lng))

        this.marker.setPosition(new google.maps.LatLng(eventLocation.lat, eventLocation.lng)); 
    }


    render() {
    
        const style={height: "350Px", width: "100%", border: "solid 2px grey"}
        return (     
        <div ref={(c)=> {this.mapDiv = c}} style={style}>
            Map Loading...
        </div> 
        );
    }
}

MapContainer.propTypes ={
    google: PropTypes.shape({
        maps: PropTypes.shape({
            Map: PropTypes.func.isRequired,
            Marker: PropTypes.func.isRequired,
            InfoWindow: PropTypes.func.isRequired,
        }).isRequired
    }).isRequired,
}


export default GoogleApiWrapper({
  apiKey: process.env.REACT_APP_GOOGLE_KEY
})(MapContainer)