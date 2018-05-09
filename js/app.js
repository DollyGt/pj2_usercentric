var map; // the google map object
var selectedCity; // for the current city searched for
var markers = []; // to store the makers drawn on the map (so they can be cleared)

/*
 initApp gets called when the map is loaded
 The callback is located in the index.html file where the google library is included
    (...callback=initApp...)
 */
function initApp(){

    // ensuring nothing happens until the document is ready
    $(document).ready(function() {
        var mapOptions = {
            zoom: 3,
            center: new google.maps.LatLng(43, 0)
        };

        map = new google.maps.Map($('#mapcanvas')[0], mapOptions);

        // this will hide the search results if user clicks the x
        $('.close-result-list').on('click', function(){
            console.log('clicked');
            $('.result-list').slideUp();
        });
        