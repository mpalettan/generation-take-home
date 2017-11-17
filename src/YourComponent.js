import React, { Component } from 'react';

// Wrapper for managing google maps with React: https://github.com/fullstackreact/google-maps-react
//
import {Map, Marker, GoogleApiWrapper} from 'google-maps-react';

// Needed for the list of stores
//
var Stores = require('json!../store_directory.json');

/*
* Use this component as a launching-pad to build your functionality.
*
*/

class YourComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            mapProperties: {
                zoom: 8,
                center: null,
				address: 'mexico city',
				marks: []
            },
			CDMXStores : {
				stores: [],
				locations: [],
				favorite: []
			}
        };
		
        this.InitialSteps = this.DoInitialSteps.bind(this);
		this.OnSelectStore = this.OnSelectStore.bind(this);
		this.OnSelectFavorite = this.OnSelectFavorite.bind(this);
		this.OnChildClick = this.OnChildClick.bind(this);
		this.GetPosition = this.GetPosition.bind(this);
		this.AddMark = this.AddMark.bind(this);
    }

	// Get the location (lat and lgt) associated to the given address
	//
	GetPosition(address) {
		return new Promise((resolve, reject) => {
			var geocoder = new window.google.maps.Geocoder();
			geocoder.geocode( {'address' : address}, (results, status) => {
				if (status == window.google.maps.GeocoderStatus.OK) {
					resolve(results[0].geometry.location)
				}
				else {
					reject()
				}
			})
        })
	}
	
    DoInitialSteps() {
		this.GetPosition(this.state.mapProperties.address)
			.then((center) => {this.setState({mapProperties: { center: center}})})
			.catch((error) => {alert(error)})
    }
	
	OnShowMarks() {
		// Show all the marks
		//
	}
	
	
	// This event is received when a mark is clicked
	//
	OnChildClick(key, childProps) {
		const markerId = childProps.marker.get('title');
		
		// The corresponding store has to be added to favorite
		//
		var arrFav = this.state.CDMXStores.favorite;

		arrFav.push(<option key = {markerId.Name} value = {markerId.Address}> {markerId.Name} </option>);
		this.setState({CDMXStores: {favorite: arrFav}})
	}
	
	AddMark(index) {
		var locationCenter = null;
		var locationStore = null;
		var arrMarks = []; 		// = this.state.mapProperties.marks;
		var arrLocat = [];      // = this.state.CDMXStores.locations;

		if (this.state.CDMXStores.locations != null) {
			
			// Check if the location has been previously obtained
			//
			this.state.CDMXStores.locations.forEach((element) => {
				if (element.store == this.state.CDMXStores.store[index].Name) {
					locationCenter = element.center
					return
				}
			})
		}
		
		// There is no location => it has to be obtained
		//
		if (locationCenter == null) {
			this.GetPosition(Stores[index].Address)
				.then((center) => {
					locationCenter = center;
					locationStore = {
						center : center,
						store : Stores[index].Name
					}
					arrLocat.push(locationStore);
					//this.setState({CDMXStores : {locations: arrLocat}})
				})
				.catch((error) => {console.log(error)})
				
				// Add the mark
				//
				if (locationCenter != null) {
					arrMarks.push(<Marker title = {Stores[index].Name} name = {Stores[index].Address} position = {{lat: locationCenter.lat.value, lng: locationCenter.lng.value}}/>);
				}
		}
		if (locationCenter != null) {
			this.setState({mapProperties: {center: locationCenter, marks: arrMarks}})
		}
	}
	
	// After a store if selected the corresponding mark is added to the map
	//
	OnSelectStore(event, index) {
		this.AddMark(event.target.selectedIndex)
	}

	// After a favorite if selected the corresponding mark is added to the map
	//
	OnSelectFavorite(event, index) {
		this.AddMark(event.target.selectedIndex)
	}
	
	// Frontend initial actions 
	//
	componentWillMount() {
		// Load the stores names into the correspondig combobox
		//
		var arrStore = [];

		Object.keys(Stores).forEach((key) => {
			// Addresses have to be changed in order to be valid to Google-maps 
			// -- I did it by hand in the JSON --
			//
			arrStore.push(<option key = {Stores[key].Name} value = {Stores[key].Address}> {Stores[key].Name} </option>);
		})
		this.setState({CDMXStores: {stores: arrStore}})
	}

	render() {
		return (
			<div className = 'container-fluid' style = {divStyle}>
				<form className = 'form-inline'>
					<div className = 'form-group'>
						<label>List of Stores: </label>
						<select name = 'stores' className = 'form-control' onChange = {this.OnSelectStore}>
							{this.state.CDMXStores.stores}
						</select>					
					</div>
					<div className = 'form-group'>
						<label>List of Favorite: </label>
						<select name = 'favorite' className = 'form-control' onChange = {this.OnSelectFavorite}>
							{this.state.CDMXStores.favorite}
						</select>					
					</div>
					<button type = 'submit' className = 'btn btn-primary' onClick = {() => this.OnShowMarks()}>Show stores</button>
				</form>
				<Map style = {mapStyle}
					 google = {this.props.google}
					 zoom = {this.state.mapProperties.zoom}
					 center = {this.state.mapProperties.center}
					 containerStyle = {containerStyle}
					 onReady = {this.InitialSteps}
					 onChildClick = {this.OnChildClick}>
						{this.state.mapProperties.marks}
				</Map>
			</div>
		);
	}
}

// Styles
//
var divStyle = {
	border: 'blue',
	borderWidth: 3,
	borderStyle: 'solid',
	padding: 1
};

const containerStyle = {position: 'relative'};

var mapStyle = {
	height: '500px',
    width: '100%',
    position:'relative'
};

export default GoogleApiWrapper({
    apiKey: ('AIzaSyCVH8e45o3d-5qmykzdhGKd1-3xYua5D2A')
})(YourComponent)
