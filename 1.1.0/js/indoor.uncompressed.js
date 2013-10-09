L.indoor = 
 {  
  latLng: function(lat, lng, level) {
    var latLng = new L.LatLng(lat, lng);
    latLng.level = level;
    return latLng;
  },
  map: function(element, _, options, callback) {
    if(!options) options = {};
//    if(options.legendControl == undefined) options.legendControl = false;

    var mapDiv = $(document.getElementById(element));
    mapDiv.css('opacity', 0.00001);
    var map = new L.mapbox.map(element, undefined, options);
   
    var streetLayer = L.mapbox.tileLayer({
      tiles: [window.location.protocol+'//c.tiles.mapbox.com/v3/examples.map-szwdot65/{z}/{x}/{y}.png'],
      scheme: 'xyz',
      version: '1.0.0',
      center: [0, 0],
      maxzoom: 18,
      minzoom: 1
    });

    var virtualCoordinates = false;

    map.enableStreetMap = function() {
      if(!virtualCoordinates)  {
        if(!map.hasLayer(streetLayer)) map.addLayer(streetLayer);
      } else {
        console.log('indoor.js warning: street map can\'t be enabled if the map isn\'t in a mercator projection.');
        console.log('indoor.js warning: the projection is defined in the export process by indoor.io. please re-export.');
      }
    }

    map.disableStreetMap = function() {
      if(map.hasLayer(streetLayer)) map.removeLayer(streetLayer);

    }

    var levelControl = _.levelControl == undefined? true : _.levelControl;
    var currentLevel = undefined; 
    var levels = {};
    var targetLevel = undefined;
    var levelCount = 0;
    var initialCenterSet = false;
    var _level = 0;
    var markerStyleFunction = undefined;

    var highlights = {
      areas: {
      }, poi: {
      }, polygons: {

      }, specifiedAreas : {}
    }

    map.getFeatures = function(arg1, arg2) {
      var iteratorFunction = typeof arg1 == 'function'? arg1 : (typeof arg2 == 'function'? arg2 : null);
      var queryObject = typeof arg1 == 'object'? arg1 : (typeof arg2 == 'object'? arg2 : null);
      var queryString = typeof arg1 == 'string'? arg1 : (typeof arg2 == 'string'? arg2 : null);
      var results = [];

      if(!queryString && !queryObject) {
        for(var l in levels) {
 	  if(levels[l] != currentLevel) continue;
          for(var f in levels[l].geojson.features) {
            var feature = levels[l].geojson.features[f];
            results.push(feature);
          }
        } 
      } else if(queryString) {
        for(var l in levels) {
          for(var f in levels[l].geojson.features) {
            var feature = levels[l].geojson.features[f];
	    feature.level = levels[l].name;
	    feature.properties.level = feature.level;
	    feature.levelIndex = levels[l].levelIndex;

            var match = false;
	   
            for(var parameter in feature.properties) {
              if(queryString == feature.properties[parameter]) match = true;
            }
            if(match && feature.geometry.coordinates[0].length > 0) {
	      results.push(feature);
	    }
	  }
        }
      } else if(queryObject) {
        var isRegexp = true;
 	for(var i in queryObject) 
	  isRegexp = false;
 
	if(isRegexp) {
        for(var l in levels) {
          for(var f in levels[l].geojson.features) {
            var feature = levels[l].geojson.features[f];
	    feature.level = levels[l].name;
	    feature.properties.level = feature.level;
	    feature.levelIndex = levels[l].levelIndex;

            var match = false;
	   
            for(var parameter in feature.properties) {
              if((new String(feature.properties[parameter])).match(queryObject)) match = true;
            }
            if(match && feature.geometry.coordinates[0].length > 0) {
	      results.push(feature);
	    }
	  }
        }
	  

	} else {
          var parameters = queryObject;

      for(var l in levels) {
        for(var f in levels[l].geojson.features) {
          var feature = levels[l].geojson.features[f];
	  feature.level = feature.properties.level = levels[l].name;
	  feature.levelIndex = levels[l].levelIndex;
          var match = true;
          for(var parameter in parameters) {
	    if(!feature.properties[parameter]) match = false;
            else {
              if(typeof parameters[parameter] == 'string') {
                if(feature.properties[parameter] != parameters[parameter]) match = false;
              } else {
                if(!(new String(feature.properties[parameter])).match(parameters[parameter])) match = false;
              }
            }
          }
          if(match && feature.geometry.coordinates[0].length > 0) {
	    results.push(feature);
	  }
	}
      }
        }
      }
      var finalResults = null;
      if(iteratorFunction) {
        finalResults = [];
        for(var i=0;i<results.length;i++) {
          if(iteratorFunction(results[i]) !== false) finalResults.push(results[i]);
	  else continue;
        }
      } else {
        finalResults = results;
      }

      return finalResults;
   }

   map.fitFeatures = function(feature) {
     var _features;
     if(feature.geometry) _features = [feature];
     else _features = feature;
     map.fitBounds(_features[0].geometry.coordinates);
     map.setLevel(_features[0].level);
   }

    map.clearHighlight = function(highlight) {
      var id = typeof highlight == 'string'? highlight : highlight.id;

      if(highlights.specifiedAreas[id]) delete highlights.specifiedAreas[id];
      if(highlights.areas[id]) delete highlights.areas[id];
      updateFeatures();
    }

    map.highlightFeatures = function(area, style) {
      var id = Math.floor(Math.random()*Math.pow(10, 10));      
      highlights.specifiedAreas[id] = {id: id, feature: area, style: style};      
      updateFeatures();
      return highlights.specifiedAreas[id];
    }

    map.clearHighlights = function() {
      removeHighlightPolygons();
      highlights.areas = {};
      highlights.specifiedAreas = {};
    }

    map.convertLatLng = function(latLng, callback) {
      if(virtualCoordinates) $.ajax({
        processData: false, 
	type: 'POST', 
        data: 'data='+JSON.stringify({lat: latLng.lat, lng: latLng.lng}),
        dataType: 'jsonp',
        jsonp: 'callback',
	contentType: 'application/json',
        url: window.location.protocol+'//tiles.indoor.io/export/web/'+_.map+'/'+routingId+'/convertLatLng'
      }).done(function(location) {
        callback(null, new L.LatLng(location.lat, location.lng));
      }).fail(function(error) {
        callback(error);
      });
      else callback(null, new L.LatLng(latLng.lat, latLng.lng));

    }

    function removeHighlightPolygons() {
      for(var i in highlights.polygons) {
        for(var p in highlights.polygons[i]) {
	  if(map.hasLayer(highlights.polygons[i][p].polygon)) map.removeLayer(highlights.polygons[i][p].polygon);
	}  
      }
      highlights.polygons = {};


    }
  
    function updateFeatures() {
      removeHighlightPolygons();

      for(var area in highlights.specifiedAreas) {
	var highlight = highlights.specifiedAreas[area];
        var feature = highlight.feature;
	var _features = [];
 	if(feature.geometry) _features.push(feature);
	else _features = feature;
	for(var i=0;i<_features.length;i++) {
          var polygon = new L.Polygon(_features[i].geometry.coordinates, highlight.style);
	  if(_features[i].levelIndex == currentLevel.levelIndex) polygon.addTo(map).bringToFront();
          if(!highlights.polygons[currentLevel.levelIndex]) highlights.polygons[currentLevel.levelIndex] = [];
          highlights.polygons[currentLevel.levelIndex].push({feature: _features[i], polygon: polygon});
	  
	}
      }

      for(var hili in highlights.areas) {
        var highlight = highlights.areas[hili];

        for(var f in currentLevel.geojson.features) {
          var feature = currentLevel.geojson.features[f];
          var match = true;
          for(var parameter in highlight.parameters) {
	    if(highlight.parameters[parameter] != feature.properties[parameter]) match = false;
          }
	  if(match && feature.geometry.coordinates[0].length > 0) {	

	    var coordinates = [];
//	    for(var i in feature.geometry.coordinates[0]) 
  //  	      coordinates.push([feature.geometry.coordinates[0][i][1], feature.geometry.coordinates[0][i][0]]);	 
	    var polygon = new L.Polygon(feature.geometry.coordinates, highlight.style).addTo(map).bringToFront();
	    if(!highlights.polygons[currentLevel.levelIndex]) highlights.polygons[currentLevel.levelIndex] = [];
	    highlights.polygons[currentLevel.levelIndex].push({feature: feature, polygon: polygon});
	  }
	  
        }
      }

    }

    function _setLevel(level) {
      _level = level;
      if(currentLevel) {
        map.removeLayer(currentLevel.tileLayer);
	map.removeLayer(currentLevel.gridLayer);
	if(currentLevel.markerLayer && map.hasLayer(currentLevel.markerLayer)) map.removeLayer(currentLevel.markerLayer);
      }
 
      $('#level_chooser a').attr('class', '');
      $('#level_chooser a[level='+level+']').attr('class', 'leaflet-disabled');
      var tileLayer = L.mapbox.tileLayer(levels[level]);
      map.addLayer(tileLayer);
      var gridLayer = L.mapbox.gridLayer(levels[level]);
      map.addLayer(gridLayer);
      map.addControl(L.indoor.gridControl(gridLayer, {click: _.click, hover: _.hover}));
      levels[level].gridLayer = gridLayer;
      levels[level].tileLayer = tileLayer;
      currentLevel = levels[level];
      if(levels[level].geojson && markerFilterFunction) {
//	levels[level].markerLayer = new L.mapbox.markerLayer(levels[level].geojson).on('click', function() {});
//	levels[level].markerLayer.setFilter(markerFilterFunction).addTo(map);		 
      }
      try {
        streetLayer.bringToBack();
      } catch(e) {}
     
      for(var i in map._layers) {
	if(map._layers[i]._latlng) {
	  if(map._layers[i]._latlng.level) {
	    if(map._layers[i]._latlng.level == map.getLevel() && map._layers[i].setOpacity) {
	      map._layers[i].setOpacity(1);
	    } else if(map._layers[i].setOpacity) {
	      map._layers[i].setOpacity(0);
	    }
	  }
	}
      }

      updateFeatures();
      updateRoutes();
      return map;
    }

    map.setFeatureStyleFunction = function(filter) {
      markerStyleFunction = filter;
      if(currentLevel) {
        var featureLayers = levels[map.getLevel()].markerLayer._layers;
      for(var feature in featureLayers) {
        markerStyleFunction(featureLayers[feature].feature, featureLayers[feature].options);
      }
	}
    }

    map.setMarkerFilterFunction = function(filter) {
      markerFilterFunction = filter;
      if(levels[map.getLevel()].geojson && markerFilterFunction) {
	if(levels[map.getLevel()].markerLayer && map.hasLayer(levels[map.getLevel()].markerLayer)) {

	} else {
	  levels[map.getLevel()].markerLayer = new L.mapbox.markerLayer(levels[map.getLevel()].geojson).addTo(map);
	}
	levels[map.getLevel()].markerLayer.setFilter(markerFilterFunction);;		 
      }
    }

    map.getLevels = function() {
      var levelArray = [];
      for(var i in levels) levelArray.push(i);
      return levelArray;
    }

    function getLevelIndex() {
      return currentLevel.levelIndex;
    }

    map.getLevel = function() {
      return _level;
    }     

    map.setLevel = function(level) {
      if(levels[level] != undefined) {
        _setLevel(level);
      } else {
        targetLevel = level;
      }
    };


    var routingId = null;
    var shownRoutes = {};
    var markerFilterFunction = null;

    map.showRoute = function(route, options) {
      options = options?options:{};
      
      if(!options.color) options.color = '#000';
      
      var lines = { levels: {} };
      for(var i in levels) lines.levels[levels[i].levelIndex] = {polyline: null, points: []};


      var currentLine = [];
      var first = false;
      var last = undefined;
      for(var i=0;i<route.length;i++) {
	last = route[i];
        if(!first) {
 	  first = route[i];
	}
	if(route[i].l != undefined) route[i].level = route[i].l;

	if(currentLine.length == 0) {
  	  currentLine.push(route[i]);
	} else {
	  if(currentLine[currentLine.length-1].levelIndex == route[i].levelIndex) {
	    currentLine.push(route[i]);
   	} else {
            currentLine.push(route[i]);
	    lines.levels[currentLine[0].levelIndex].points.push(currentLine);
	    currentLine = [route[i]];
	  }	
	}
      }
      if(currentLine.length > 1) {
	lines.levels[currentLine[0].levelIndex].points.push(currentLine);
      } 


      var id = Math.floor(Math.random()*Math.pow(10, 10));      

      for(var i in lines.levels) {
        lines.levels[i].polyline = new L.MultiPolyline(lines.levels[i].points, options.lineOptions);
      }
      if(route.length > 1) {
        var properties = undefined; 
        if(options.startIcon) properties = {icon: options.startIcon};
        lines.startMarker = new L.marker(new L.LatLng(first.lat, first.lng), properties);
        if(!options.startIcon) lines.startMarker.setOpacity(0);

   	properties = undefined;
	if(options.endIcon) properties = {icon: options.endIcon};
        lines.endMarker = new L.marker(new L.LatLng(last.lat, last.lng), properties);
        if(!options.endIcon) lines.endMarker.setOpacity(0);
      }
      shownRoutes[id] = lines;
      shownRoutes[id].options = options;
      shownRoutes[id].status = {};
      shownRoutes[id].data = route;
      updateRoutes();
      if(shownRoutes[id].options.animate) animateRoute(shownRoutes[id]);

      return id;
    }

    function updateRoutes() {
      for(var i in shownRoutes) {
        if(!shownRoutes[i]) continue;
        for(var l in shownRoutes[i].levels) {
          if(map.hasLayer(shownRoutes[i].levels[l].polyline)) map.removeLayer(shownRoutes[i].levels[l].polyline);
	}
        if(map.hasLayer(shownRoutes[i].startMarker)) map.removeLayer(shownRoutes[i].startMarker);
        if(map.hasLayer(shownRoutes[i].endMarker)) map.removeLayer(shownRoutes[i].endMarker);

	if(shownRoutes[i].data.length > 0) {
          if(shownRoutes[i].levels[getLevelIndex()].polyline) map.addLayer(shownRoutes[i].levels[getLevelIndex()].polyline);
	  if(shownRoutes[i].data[0].levelIndex == getLevelIndex())
 	    map.addLayer(shownRoutes[i].startMarker);
	  if(shownRoutes[i].data[shownRoutes[i].data.length-1].levelIndex == getLevelIndex())
            map.addLayer(shownRoutes[i].endMarker);
        }
      }
    }

    map.hideRoute = function(route) {
      if(shownRoutes[route] != undefined) {
      for(var i in shownRoutes[route].levels) {
        if(shownRoutes[route].levels[i].polyline && map.hasLayer(shownRoutes[route].levels[i].polyline)) map.removeLayer(shownRoutes[route].levels[i].polyline); 
      }
      if(shownRoutes[route].startMarker && map.hasLayer(shownRoutes[route].startMarker)) map.removeLayer(shownRoutes[route].startMarker); 
      if(shownRoutes[route].endMarker && map.hasLayer(shownRoutes[route].endMarker)) map.removeLayer(shownRoutes[route].endMarker); 
      if(shownRoutes[route].headMarker && map.hasLayer(shownRoutes[route].headMarker)) map.removeLayer(shownRoutes[route].headMarker);
      shownRoutes[route].status.animationProgress = shownRoutes[route].status.animationMax;
      shownRoutes[route] = undefined;
      }
    }

    function animateRoute(route) {
      if(route.data.length == 0) return;
      if(!route.options.animateIcon) route.options.animateIcon = new L.divIcon({html: 'X'});
      if(!route.headMarker && route.data.length > 0) {
	route.headMarker = new L.marker(new L.LatLng(route.data[0].lat, route.data[0].lng), {icon: route.options.animateIcon});
      }

      if(route.status.animationProgress == undefined) route.status.animationProgress = 0;

      if(!route.totalLength) {
        route.totalLength = 0;
	for(var p=0;p<route.data.length-1;p++) {
	  route.data[p].distanceToNext = Math.sqrt(Math.pow(route.data[p].lat-route.data[p+1].lat, 2)+Math.pow(route.data[p].lng-route.data[p+1].lng, 2));
	  route.data[p].totalDistanceToThis = route.totalLength;
   	  route.totalLength += route.data[p].distanceToNext;
	}
	route.data[route.data.length-1].totalDistanceToThis = route.totalLength;
	route.data[route.data.length-1].distanceToNext = -1;

	var refDistance = 0.0005640361071184976;
	var refCount = 60;
	route.status.animationMax = route.totalLength/refDistance*refCount;

	route.animationPoints = [];
	var animationUnit = route.totalLength/(route.status.animationMax-1);
	
	for(var i=0;i<route.status.animationMax;i++) {
	  var ometer = i*animationUnit; 
	  var previousPoint = route.data[0];
	  var nextPoint = route.data[0];
	  for(var p=0;p<route.data.length-1 && route.data[p].totalDistanceToThis<ometer;p++) {
	    previousPoint = nextPoint;
	    nextPoint = route.data[p+1];
	  }
 
	  if(previousPoint == nextPoint) 
	    route.animationPoints.push(previousPoint);
	  else {
	    var distanceLeft = ometer-previousPoint.totalDistanceToThis;
	    var relDistance = distanceLeft/previousPoint.distanceToNext;
	    route.animationPoints.push({lat: previousPoint.lat+relDistance*(nextPoint.lat-previousPoint.lat), lng: previousPoint.lng+relDistance*(nextPoint.lng-previousPoint.lng), level: previousPoint.level});
	  }
	}
      }
      var levelChangeDelay = 1000;
      var levelChangeFactor = 0;
      if(route.status.animationProgress >= route.status.animationMax) {
        route.animationComplete = true;
	route.status.animationProgress = undefined;
	if(map.hasLayer(route.headMarker)) 
	  map.removeLayer(route.headMarker);
      } else {
        // animation here
        if(!map.hasLayer(route.headMarker)) map.addLayer(route.headMarker);
 	var latLng = new L.LatLng(route.animationPoints[route.status.animationProgress].lat, route.animationPoints[route.status.animationProgress].lng);
        route.headMarker.setLatLng(latLng);
	map.panTo(latLng);
	if(map.getLevel() != route.animationPoints[route.status.animationProgress].level) {
  	  map.setLevel(route.animationPoints[route.status.animationProgress].level);
	  levelChangeFactor = 1;
	}
      }
  
      if(!route.animationComplete) {
	route.status.animationProgress = Math.min(route.status.animationProgress+1, route.status.animationMax);
	setTimeout(function() { animateRoute(route); }, 1000/15+levelChangeDelay*levelChangeFactor);
      } 
    }

    map.getFeatureById = function(id) {
      for(var i in levels)
	if(levels[i].geojson.index[id]) return levels[i].geojson.index[id];
      return null;
    }

    map.getFeaturesAt = function(latLng) {
      var results = [];
      return results;
    }

    map.getRoute = function(a, b, callback) {
      if(!routingId) callback('Routing not enabled on the specified map.');

      if(!a.level && a.l) a.level = a.l;
      if(!a.l && a.level) a.l = a.level;
      if(!b.level && b.l) b.level = b.l;
      if(!b.l && b.level) b.l = b.level;
      if(!a.lng && a.lon) a.lng = a.lon;
      if(!a.lon && a.lng) a.lon = a.lng;
      if(!b.lng && b.lon) b.lng = b.lon;
      if(!b.lon && b.lng) b.lon = b.lng;

      var p1 = null;
      var p2 = null; 

      p1 = {lat: b.lat, lng: b.lng, lon: b.lon, level: b.level, l: b.l};
      p2 = {lat: a.lat, lng: a.lng, lon: a.lon, level: a.level, l: a.l};

      p1.level = p1.l = parseInt(levels[p1.level].levelIndex);
      p2.level = p2.l = parseInt(levels[p2.level].levelIndex);
      
      $.ajax({
	data: 'data='+JSON.stringify({p1: p1, p2: p2, virtualCoordinates: virtualCoordinates}),
        dataType: 'jsonp',
        jsonp: 'callback',
        url: window.location.protocol+'//tiles.indoor.io/export/web/'+_.map+'/'+routingId+'/graph/route.json?callback=?',
	contentType: 'text/json',
	type: 'POST',
        processData: false
      }).done(function(data) {
	  for(var i in data) {
	    data[i].level = data[i].level?data[i].level:data[i].l;
	    
	    for(var l in levels) {
	      if(data[i].level == levels[l].levelIndex) { 
		data[i].levelIndex = data[i].level;
	        data[i].l = data[i].level = levels[l].name;
		break;
	      }
	    }	    
	  }

          callback(null, data);
        }).fail(function(data) {
          callback('Server or connection problem. Route could not be calculated.');
        });
    }

     var loadedLevels = [];

     $.ajax({
       dataType: 'jsonp',
       jsonp: 'callback',
       url: window.location.protocol+'//tiles.indoor.io/export/web/'+_.map+'/'+_.project+'?callback=?'
     }).done(function(project) {
      if(typeof project == 'string') project = JSON.parse(project);
      for(var i in project.levels) {
	if(!routingId) routingId = project.levels[i].source;

        (function(i) { return function() {
 	  loadedLevels.push({});
          $.ajax({
            dataType: 'jsonp',
            jsonp: 'callback',
            url: window.location.protocol+'//tiles.indoor.io/api/Tileset/'+project.levels[i].source+'?callback=?'
          }).done((function(index) { return function(data) {
            $.ajax({
              dataType: 'jsonp',
              jsonp: 'callback',
              url: window.location.protocol+'//tiles.indoor.io/export/web/'+_.map+'/'+project.levels[i].source+'/geojson.json'+'?callback=?'
            }).done(function(geojson) {
	      if(data.bounds[0] == 0 && data.bounds[1] == 0) {
		virtualCoordinates = true;
	      }

	      levels[data.name] = data;
              levels[data.name].levelIndex = parseInt(i);	

	      loadedLevels[index] = data.name;
	      geojson.index = {};
 	      for(var f in geojson.features) {
		var feature = geojson.features[f];
                delete feature.type;
                feature.levelIndex = levels[data.name].levelIndex;
		  if(geojson.features[f].properties['_referenceLocation']) {
		    var ref_loc = geojson.features[f].properties['_referenceLocation'].split(',');
		    delete geojson.features[f].properties['_referenceLocation'];
		    geojson.features[f].properties.markerLocation = new L.LatLng(ref_loc[1], ref_loc[0]);
		    geojson.features[f].properties.markerLocation.level = data.name;
		  } 
		  if(geojson.features[f].properties['_featureIdentifier']) 
		    geojson.index[geojson.features[f].properties['_featureIdentifier']] = geojson.features[f];
		  for(var c=0;c<feature.geometry.coordinates.length;c++) {
                    for(var cc=0;cc<feature.geometry.coordinates[c].length;cc++) {
                      feature.geometry.coordinates[c][cc] = 
                        new L.indoor.latLng(feature.geometry.coordinates[c][cc][1], feature.geometry.coordinates[c][cc][0], data.name);
		    }
 	          }
		}
	       levels[data.name].geojson = geojson;
	       
	       if(map.getLevel() == data.name && markerFilterFunction) {
		 levels[i].markerLayer = new L.mapbox.markerLayer(geojson);
		 levels[i].markerLayer.setFilter(markerFilterFunction).addTo(map);	
	       }
		var levelCount = 0;
	     for(var j in levels) {
		levelCount++;
	     }
 	    if(levelCount == project.levels.length) {
		loadedLevels.reverse();
		if(levelControl) {
		  var level_chooser = $(document.getElementById(element)).find(".leaflet-top.leaflet-left #level_chooser");
	    	  if(level_chooser.length > 0) level_chooser.remove();
	          else $(document.getElementById(element)).find(".leaflet-top.leaflet-left").append('<div style="font-weight: bold; font-size: 13px; color: #444; text-shadow: 0px 1px 0px white; margin-left: 10px; margin-top: 10px; margin-bottom: -8px;">Levels</div>');
	          $(document.getElementById(element)).find(".leaflet-top.leaflet-left").append('<div class="leaflet-bar leaflet-control" id="level_chooser"></div>');
	          for(var j=0;j<loadedLevels.length;j++) {
                    $(document.getElementById('level_chooser')).append('<a onmousemove="event.stopPropagation(); event.preventDefault();" onclick="event.stopPropagation();map.setLevel(\''+loadedLevels[j]+'\');" style="font-weight: bold; cursor: hand; text-decoration: none;" level="'+loadedLevels[j]+'">'+loadedLevels[j]+'</a>');
		  }
                }

	      mapDiv.hide().css('opacity', 1).fadeIn();
	      if(callback) {
		callback(_.project, element);
	      }
	    }



	    if(data.name == targetLevel && currentLevel == undefined) {
   	      _setLevel(targetLevel);
   	    } else if(targetLevel == undefined && currentLevel == undefined) {
	      _setLevel(data.name);
  	    }

	    if(!initialCenterSet) {
	      map.setMaxBounds(new L.LatLngBounds(new L.LatLng(data.bounds[1], data.bounds[0]), new L.LatLng(data.bounds[3], data.bounds[2])));
	      map.setView(new L.LatLng(data.center[1], data.center[0]), map.getMinZoom());
	      initialCenterSet = true;
	    }

	
          });
 	    }; })(i));

        };})(i)();
      }
    });
    return map;
  }, gridControl: function(gridLayer, options) {
    var instance = new L.mapbox.gridControl(gridLayer);
    for(var i in options) {
      instance.options[i] = options[i];
    }
    instance.__proto__._show = function() {};

    if(instance.options.click) instance._click = function(event) {
     event.latLng.level = map.getLevel();

     var _data = {};
     for(var i in event.data) _data[i] = event.data[i];
     event.data = _data;
 
     if(event.data['_referenceLocation']) {
       var ref_loc = event.data['_referenceLocation'].split(',');
       delete event.data['_referenceLocation'];
       event.data.markerLocation = new L.LatLng(ref_loc[1], ref_loc[0]);
     }


     if(event.data && event.data['_featureIdentifier']) {
       var featureIdentifier = event.data['_featureIdentifier'];
       event.feature = map.getFeatureById(featureIdentifier);
       event.feature.properties.featureIdentifier = featureIdentifier;
       for(var i in event.feature.properties) 
         if(event.feature.properties[i].length == 0) delete event.feature.properties[i];

       delete event.feature.properties['_featureIdentifier'];
     }
     delete event.data;    
     this.options.click(event);
     }
    if(instance.options.hover) instance._mousemove = function(event) {
      event.latLng.level = map.getLevel();
      if(event.data && event.data['_featureIdentifier']) {
       var featureIdentifier = event.data['_featureIdentifier'];
       event.feature = map.getFeatureById(featureIdentifier);
       event.feature.properties.featureIdentifier = featureIdentifier;
       for(var i in event.feature.properties) 
         if(event.feature.properties[i].length == 0) delete event.feature.properties[i];

       delete event.feature.properties['_featureIdentifier'];
     }
     delete event.data;    
      this.options.hover(event);  
    }
    return instance;
  }
};

