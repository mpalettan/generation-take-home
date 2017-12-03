import React, { Component } from 'react';

// Wrapper for managing google maps with React: https://github.com/istarkov/google-map-react
//
import {Map, Marker, InfoWindow, GoogleApiWrapper} from 'google-maps-react';

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
			CDMXStores: {
				stores: [],
				locations: [],
				favorite: []
			},
			MarkIndex: {
				marker: null,
				store: "",
				index: 0
			}
        };
		
        this.InitialSteps = this.DoInitialSteps.bind(this);
		this.OnSelectStore = this.OnSelectStore.bind(this);
		this.OnSelectFavorite = this.OnSelectFavorite.bind(this);
		this.OnMarkClicked = this.OnMarkClicked.bind(this);
		this.OnMapClicked = this.OnMapClicked.bind(this);
		this.OnShowMarks = this.OnShowMarks.bind(this);
		this.OnClearMarks = this.OnClearMarks.bind(this);
		this.GetPosition = this.GetPosition.bind(this);
		this.AddMark = this.AddMark.bind(this);
		this.AddMarksFromTo = this.AddMarksFromTo.bind(this);
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
			.then((center) => {this.setState({mapProperties: {center: center}})})
			.catch((error) => {alert(error)})
    }

	OnShowMarks() {
		// Show all the marks
		//
		var i = this.state.MarkIndex.index;
		
		this.AddMarksFromTo(i, i + 9);
		this.setState({MarkIndex: {marker: null, index: i + 10}})
	}
	
	OnClearMarks() {
		// Clear all the marks
		//
		var locationCenter = this.state.mapProperties.center;

		this.setState({mapProperties: {center: locationCenter, marks: null}, MarkIndex: {marker: null, index: 0}})
	}
	
	// This event is received when a mark is clicked
	//
	OnMarkClicked(props, marker, e) {
		var arrLocat = [];
		var arrStores = [];
		var arrFavorite = [];
		var found = false; 
		var i = this.state.MarkIndex.index;
		
		// The corresponding store has to be added to favorite
		// First it is neccesary to check if it is already in the list of favorite
		//
		if (this.state.CDMXStores.favorite != null) {
			this.state.CDMXStores.favorite.forEach((element) => {
				if (element.key == "Fav-" + props.title) {
					found = true;
					return;
				}
			})
		}

		// Take current information
		//
		if (!found) {
			arrStores = this.state.CDMXStores.stores;
			arrLocat = this.state.CDMXStores.locations;
			if (this.state.CDMXStores.favorite != null) {
				this.state.CDMXStores.favorite.forEach((key, idx) => {
					arrFavorite.push(this.state.CDMXStores.favorite[idx]);
				})
			}
			arrFavorite.push(<option key = {"Fav-" + props.title} value = {props.value}> {props.title} </option>);
		
			// Upgrade state
			//
			this.setState({CDMXStores : {locations: arrLocat, stores: arrStores, favorite: arrFavorite}})
		}
		
		// Upgrade de active marker in order to see the corresponding info window
		//
		this.setState({MarkIndex: {marker: marker, store: props.title, index: i}})
	}
	
	OnMapClicked() {
		var i = this.state.MarkIndex.index;
		
		this.setState({MarkIndex: {marker: null, index: i}})
	}

	// Add a new mark related to the stored indexed by "index"
	// "setCenter" indicates whether the center has to be or not moved
	//
	AddMark(index, setCenter) {
		var locationCenter = null;
		var locationStore = null;
		var arrMarks = [];
		var arrLocat = [];
		var arrStores = [];
		var arrFavorite = [];
		var found = false; 

		if (this.state.CDMXStores.locations != null) {
			// Check if the location has been previously obtained
			//
			this.state.CDMXStores.locations.forEach((element) => {
				if (element.store == Stores[index].Name) {
					locationCenter = element.center;
					found = true;
			
					// Add the mark. First it is neccesary to check is the mark is already in the list.
					// It is also neccesary to copy all the marks the list already has.
					// 
					if (this.state.mapProperties.marks != null) {
						this.state.mapProperties.marks.forEach((key, idx) => {
							if (this.state.mapProperties.marks[idx].key == "Mrk: " + index) {
								return;
							}
							arrMarks.push(this.state.mapProperties.marks[idx]);
						})
					}
					arrMarks.push(<Marker 
						key = {"Mrk: " + index} 
						title = {Stores[index].Name} 
						name = {Stores[index].Address} 
						value = {index}
						position = {{lat: locationCenter.lat(), lng: locationCenter.lng()}}
						onClick = {this.OnMarkClicked}/>);
					if (setCenter == false) { locationCenter = this.state.mapProperties.center }
					this.setState({mapProperties: {center: locationCenter, marks: arrMarks}});
					return;
				}
			})
		}
		
		// There is no location => it has to be obtained
		// It is the first time for this mark
		//		
		if (!found) {		
			this.GetPosition(Stores[index].Address)
				.then((center) => {
					locationCenter = center;
					locationStore = {
						center : center,
						store : Stores[index].Name
					}
					
					// Upgrade the new array of locations. First it is neccesary to copy the locations previously obtained
					//
					arrStores = this.state.CDMXStores.stores;
					arrFavorite = this.state.CDMXStores.favorite;
					if (this.state.CDMXStores.locations != null) {
						Object.keys(this.state.CDMXStores.locations).forEach((key) => {
							arrLocat.push(this.state.CDMXStores.locations[key]);
						})
					}
					
					arrLocat.push(locationStore);
					this.setState({CDMXStores : {locations: arrLocat, stores: arrStores, favorite: arrFavorite}});
					
					// Add the mark. First it is neccesary to copy the marks already the map has.
					// 
					if (this.state.mapProperties.marks != null) {
						this.state.mapProperties.marks.forEach((key, idx) => {
							arrMarks.push(this.state.mapProperties.marks[idx]);
						})
					}
					arrMarks.push(<Marker 
						key = {"Mrk: " + index} 
						title = {Stores[index].Name} 
						name = {Stores[index].Address} 
						value = {index}
						position = {{lat: locationCenter.lat(), lng: locationCenter.lng()}} 
						onClick = {this.OnMarkClicked}/>);

					// Center the map to the new location and upgrade the new array of marks
					//
					this.setState({mapProperties: {center: locationCenter, marks: arrMarks}});
				})
				.catch((error) => {console.log(error)})
		}
	}

	// Add marks from the store indexed by "idxFrom" to the store indexed by "idxTo" 
	//
	AddMarksFromTo(idxFrom, idxTo) {
		var i;		
		
		// Show marks from "idxFrom" to "idxTo" indeces
		//
		if (idxFrom <= idxTo) {
			for (i = idxFrom; i <= idxTo; i++) { 
				this.AddMark(i, false);
			}
		}
	}
	
	// After a store if selected the corresponding mark is added to the map
	//
	OnSelectStore(event, index) {
		if (event.target.selectedIndex > 0) {
			this.AddMark(event.target.selectedIndex - 1, true);
		}
	}

	// After a favorite if selected the corresponding mark is added to the map
	//
	OnSelectFavorite(event, index) {
		if (event.target.selectedIndex > 0)
			this.AddMark(event.target.options[event.target.selectedIndex].value, true)
	}
		
	// Frontend initial actions 
	//
	componentWillMount() {
		// Load the stores names into the correspondig combobox
		//
		var arrStore = [];

		Object.keys(Stores).forEach((key) => {
			// Addresses have to be changed in order to be valid to Google-maps 
			// -- I did it directly in the JSON --
			//
			arrStore.push(<option key = {Stores[key].Name} value = {Stores[key].Address}> {Stores[key].Name} </option>);
		})
		this.setState({CDMXStores: {stores: arrStore}})
	}
	
	componentDidUpdate() {
	}

	render() {
		return (
			<div className = 'container-fluid' style = {divStyle}>
				<form className = 'form-inline'>
					<div className = 'form-group'>
						<label>List of Stores: </label>
						<select name = 'stores' className = 'form-control' onChange = {this.OnSelectStore}>
							<option value = "-1">--</option>
							{this.state.CDMXStores.stores}
						</select>					
					</div>
					<div className = 'form-group'>
						<label>My Favorite Stores: </label>
						<select name = 'favorite' className = 'form-control' onChange = {this.OnSelectFavorite}>
							<option value = "-1">--</option>
							{this.state.CDMXStores.favorite}
						</select>					
					</div>
					<button type = 'button' className = 'btn btn-primary' onClick = {() => this.OnShowMarks()}>Next 10 marks</button>
					<button type = 'button' className = 'btn btn-primary' onClick = {() => this.OnClearMarks()}>Clear all marks</button>
				</form>
				<Map style = {mapStyle}
					 google = {this.props.google}
					 zoom = {this.state.mapProperties.zoom}
					 center = {this.state.mapProperties.center}
					 containerStyle = {containerStyle}
					 onReady = {this.InitialSteps}
					 onClick = {this.OnMapClicked}>
						{this.state.mapProperties.marks}
						<InfoWindow
							marker = {this.state.MarkIndex.marker}
							visible = {this.state.MarkIndex.marker != null}>
								<div>
									<h1>{this.state.MarkIndex.store}</h1>
								</div>
						</InfoWindow>
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
