// Global functions/variables

const purple = '#FD3A73';
const skin = '#d59563';
const blue_dark = '#263c3f';
const green = '#6b9a76';
const blue_gray = '#38414e';
const blue_dark_2 = '#212a37';
const gray = '#9ca5b3';

 const mapCustomStyle = [{"elementType" : "geometry", "stylers" : [ {"color" : "#242f3e"} ]},
 {"elementType" : "labels.text.fill", "stylers" : [ {"color" : "#746855"} ]},
 {"elementType" : "labels.text.stroke", "stylers" : [ {"color" : "#242f3e"} ]},
 {
   "featureType" : "administrative.locality",
   "elementType" : "labels.text.fill",
   "stylers" : [ {"color" : purple} ]
 },
 {
   "featureType" : "poi",
   "elementType" : "labels.text.fill",
   "stylers" : [ {"color" : skin} ]
 },
 {
   "featureType" : "poi.park",
   "elementType" : "geometry",
   "stylers" : [ {"color" : blue_dark} ]
 },
 {
   "featureType" : "poi.park",
   "elementType" : "labels.text.fill",
   "stylers" : [ {"color" : green} ]
 },
 {
   "featureType" : "road",
   "elementType" : "geometry",
   "stylers" : [ {"color" : blue_gray} ]
 },
 {
   "featureType" : "road",
   "elementType" : "geometry.stroke",
   "stylers" : [ {"color" : blue_dark_2} ]
 },
 {
   "featureType" : "road",
   "elementType" : "labels.text.fill",
   "stylers" : [ {"color" : gray} ]
 },
 {
   "featureType" : "road.highway",
   "elementType" : "geometry",
   "stylers" : [ {"color" : "#19222E"} ]
 },
 {
   "featureType" : "road.highway",
   "elementType" : "geometry.stroke",
   "stylers" : [ {"color" : "#1f2835"} ]
 },
 {
   "featureType" : "road.highway",
   "elementType" : "labels.text.fill",
   "stylers" : [ {"color" : "#f3d19c"} ]
 },
 {
   "featureType" : "transit",
   "elementType" : "geometry",
   "stylers" : [ {"color" : "#2f3948"} ]
 },
 {
   "featureType" : "transit.station",
   "elementType" : "labels.text.fill",
   "stylers" : [ {"color" : skin} ]
 },
 {
   "featureType" : "water",
   "elementType" : "geometry",
   "stylers" : [ {"color" : "#17263c"} ]
 },
 {
   "featureType" : "water",
   "elementType" : "labels.text.fill",
   "stylers" : [ {"color" : "#515c6d"} ]
 },
 {
   "featureType" : "water",
   "elementType" : "labels.text.stroke",
   "stylers" : [ {"color" : "#17263c"} ]
 }]

export {
    mapCustomStyle
}