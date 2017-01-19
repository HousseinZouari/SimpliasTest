
  //declaration
  var map = null;
  var radius_circle = null;
  var markers_on_map = [];
  var geocoder = null;
  var infowindow = null;
  var address_lat_lng;
  var best=0;
  var compt=0;
  var radius_km = 0;
  //all_locations is just a sample, you will probably load those from database
  var all_locations = [
	  {ina:1,type: "school", name: "School 5", lat: 40.724705, lng: -73.986615},
	  {ina:5,type: "school", name: "School 6", lat: 40.724165, lng: -73.983886},
	  {ina:4,type: "school", name: "Restaurant 21", lat: 40.721819, lng: -73.991355},
	  {ina:3,type: "school", name: "Restaurant 1", lat: 80.723080, lng: -103.984340}
  ];

  //find the best point the nearst from radius point * km

 function find_best(h){
	//  alert(h);
	    var marker_lat_lng_a = new google.maps.LatLng(all_locations[h].lat,all_locations[h].lng);

		   if (h<=0)
			{
				return compt;
			}
			if (h>=all_locations.length)
			{
				return compt;
			}

			//center point i used this value to test
			address_lat_lng = new google.maps.LatLng(40.723080, -73.984340);
			var distance_from_location_a =  google.maps.geometry.spherical.computeDistanceBetween(address_lat_lng, marker_lat_lng_a);

			// iterative methods
			if (distance_from_location_a>best && distance_from_location_a<radius_km*1000)
			{
				best=distance_from_location_a;
				compt=h;

			}
			if (distance_from_location_a>radius_km*1000)
			{
				return find_best(h/2);

			}else {

				h=parseInt(h/2+h/4);
				return find_best(h);
			}
			alert('end');
			return null;

  }


  //initialize map on document ready
  $(document).ready(function(){
      var latlng = new google.maps.LatLng(40.724165, -73.998673); //you can use any location as center on map startup
      var myOptions = {
        zoom: 1,
        center: latlng,
        mapTypeControl: true,
        mapTypeControlOptions: {style: google.maps.MapTypeControlStyle.DROPDOWN_MENU},
        navigationControl: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
	  geocoder = new google.maps.Geocoder();
      google.maps.event.addListener(map, 'click', function(){
           if(infowindow){
             infowindow.setMap(null);
             infowindow = null;
           }
      });

	      navigator.geolocation.getCurrentPosition(function(position) {

             address_lat_lng = new google.maps.LatLng(40.723080, -73.984340);

            map.setCenter(address_lat_lng);

        });
      $('#location_type').change(function(){
         if(radius_circle) showCloseLocations();
      });



	  // sort elements by distance to the center
	  all_locations.sort(function(a, b) {

		  var marker_lat_lng_a = new google.maps.LatLng(a.lat, a.lng);
		   var marker_lat_lng_b = new google.maps.LatLng(b.lat, b.lng);
			address_lat_lng = new google.maps.LatLng(40.723080, -73.984340);
			var distance_from_location_a =  google.maps.geometry.spherical.computeDistanceBetween(address_lat_lng, marker_lat_lng_a);

	var distance_from_location_b = google.maps.geometry.spherical.computeDistanceBetween(address_lat_lng, marker_lat_lng_b);
	return (distance_from_location_a) - (distance_from_location_b);
});




  });




  //find points closer then 1 km
  function showCloseLocations() {
  	var i;
  	radius_km = $('#radius_km').val();
  	var address = $('#address').val();
    var location_type = $('#location_type').val();

  	//remove all radii and markers from map before displaying new ones
  	if (radius_circle) {
  		radius_circle.setMap(null);
  		radius_circle = null;
  	}
  	for (i = 0; i < markers_on_map.length; i++) {
  		if (markers_on_map[i]) {
  			markers_on_map[i].setMap(null);
  			markers_on_map[i] = null;
  		}
  	}

  	if (geocoder) {
  		geocoder.geocode({'address': address}, function (results, status) {
  			if (status == google.maps.GeocoderStatus.OK) {
  				if (status != google.maps.GeocoderStatus.ZERO_RESULTS) {

  					radius_circle = new google.maps.Circle({
  						center: address_lat_lng,
  						radius: radius_km * 1000,
  						clickable: false,
						map: map
  					});

					var test=find_best(all_locations.length/2)+1;

                    if (radius_circle) map.fitBounds(radius_circle.getBounds());
  					// for to set markers in map
					for (var j = 0; j <test; j++) {
  						(function (location) {

  							var marker_lat_lng = new google.maps.LatLng(location.lat, location.lng);
  							var distance_from_location = google.maps.geometry.spherical.computeDistanceBetween(address_lat_lng, marker_lat_lng); //distance in meters between your location and the marker
  							if (location_type == location.type && distance_from_location <= radius_km * 1000) {

  								var new_marker = new google.maps.Marker({
  									position: marker_lat_lng,
  									map: map,
  									title: location.name
  								});

								google.maps.event.addListener(new_marker, 'click', function () {
                                    if(infowindow){
             infowindow.setMap(null);
             infowindow = null;
           }
		   // information about marker
  									infowindow = new google.maps.InfoWindow(
            { content: '<div style="color:red">'+location.name +'</div>' + " is " + distance_from_location + " meters from my location",
              size: new google.maps.Size(150,50),
              pixelOffset: new google.maps.Size(0, -30)
            , position: marker_lat_lng, map: map});
  								});
  								markers_on_map.push(new_marker);
  							}

  						})(all_locations[j]);
  					}
  				} else {
  					alert("No results found while geocoding!");
  				}
  			} else {
  				alert("Geocode was not successful: " + status);
  			}
  		});
  	}
  }


