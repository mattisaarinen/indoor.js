/*
    json2.js
    2013-05-26

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, regexp: true */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (typeof JSON !== 'object') {
    JSON = {};
}

(function () {
    'use strict';

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function () {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear()     + '-' +
                    f(this.getUTCMonth() + 1) + '-' +
                    f(this.getUTCDate())      + 'T' +
                    f(this.getUTCHours())     + ':' +
                    f(this.getUTCMinutes())   + ':' +
                    f(this.getUTCSeconds())   + 'Z'
                : null;
        };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function () {
                return this.valueOf();
            };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0
                    ? '[]'
                    : gap
                    ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                    : '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0
                ? '{}'
                : gap
                ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function'
                    ? walk({'': j}, '')
                    : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());



/** indoor.js by Whatamap.com Ltd, 2013
    All rights reserved.
*/
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
    var levelIndex = {};
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

    map.getFeaturesAsync = function(arg1, callback) {
	if(!callback) return [];
      search(null, arg1, function(error, data) {
	for(var i in data.features) {
	  var feature = data.features[i];
	  feature.levelIndex = data.features[i].properties.level;
	  feature.properties.level = levelIndex[feature.levelIndex].name;
	  if(feature.geometry.type == 'Polygon') {
	    for(var j in data.features[i].geometry.coordinates) {
	      var polygon = data.features[i].geometry.coordinates[j];
	      for(var p in polygon) {
	        polygon[p] = new L.indoor.latLng(polygon[p][1], polygon[p][0], data.features[i].properties.level);
	      }
	    }
	    if(feature.properties['_referenceLocation']) {
		    var ref_loc = feature.properties['_referenceLocation'].split(',');
		    delete feature.properties['_referenceLocation'];
		    feature.properties.markerLocation = new L.LatLng(ref_loc[1], ref_loc[0], feature.properties.level);


	    }
	  } else if(feature.geometry.type == 'Point') {
	    feature.properties.markerLocation = new L.indoor.latLng(
	      feature.geometry.coordinates[1], 
	      feature.geometry.coordinates[0],
	      feature.properties.level);
				
	  }
		

  	  map.addFeaturesToIdIndex(data.features[i]);
	}
	
	callback(null, data.features);


      })
     return [];
    }

    map.addFeaturesToIdIndex = function(features) {
      if(typeof features != 'array') features = [features];
 
       for(var i in features) {
	  var feature = features[i];
          if(feature.properties['_featureIdentifier']) {
            feature.properties['featureIdentifier'] = feature.properties['_featureIdentifier'];
   	    delete feature.properties['_featureIdentifier'];
	  } else {
	    feature.properties.featureIdentifier = parseInt(Math.random()*Math.pow(10, 10));
	  }
	  featuresById[feature.properties.featureIdentifier] = feature;
       }

    }
    map.getFeatures = function(arg1, arg2, arg3) {
      if(arg2 && typeof arg2 == 'function') {
        map.getFeaturesAsync(arg1, arg2);
	return;
      }
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
            if(match && (
	      (feature.geometry.type == 'Polygon' && feature.geometry.coordinates[0].length > 0) ||
	      (feature.geometry.type == 'Point' && feature.geometry.coordinates.length > 0))) {
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
            if(match && (
	      (feature.geometry.type == 'Polygon' && feature.geometry.coordinates[0].length > 0) ||
	      (feature.geometry.type == 'Point' && feature.geometry.coordinates.length > 0))) {
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
            if(match && (
	      (feature.geometry.type == 'Polygon' && feature.geometry.coordinates[0].length > 0) ||
	      (feature.geometry.type == 'Point' && feature.geometry.coordinates.length > 0))) {
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
   var mapInstanceId = parseInt(Math.random()*Math.pow(10, 10));

   map.fitFeatures = function(feature) {
     var _features;
     if(feature.geometry) _features = [feature];
     else _features = feature;
     map.fitBounds(_features[0].geometry.coordinates);
     map.setLevel(_features[0].properties.level);
   }

    map.clearHighlight = function(highlight) {
      var id = typeof highlight == 'string'? highlight : highlight.id;

      if(highlights.specifiedAreas[id]) delete highlights.specifiedAreas[id];
      if(highlights.areas[id]) delete highlights.areas[id];
      updateFeatures();
    }

    var highlightCount = 0;
    map.highlightFeatures = function(area, style) {
      if(style.clickable == undefined) style.clickable = false;
      highlightCount++;
      var id = highlightCount;
//Math.floor(Math.random()*Math.pow(10, 10));      
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
        url: window.location.protocol+'//tile.indoor.io/export/web/'+_.map+'/'+routingId+'/convertLatLng'
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
      if(window.updateFeaturesTimer) clearTimeout(window.updateFeaturesTimer);
      window.updateFeaturesTimer = setTimeout(_updateFeatures, 1);
    }

    function _updateFeatures() {
      _updateLayers();

      removeHighlightPolygons();
      for(var area in highlights.specifiedAreas) {
	var highlight = highlights.specifiedAreas[area];
        var feature = highlight.feature;
	var _features = [];
 	if(feature.geometry) _features.push(feature);
	else _features = feature;
	for(var i=0;i<_features.length;i++) {
          var polygon = new L.Polygon(_features[i].geometry.coordinates, highlight.style);
	  if(_features[i].levelIndex == currentLevel.levelIndex) {
	    map.__indoor_addLayer(polygon); 
	    polygon.bringToFront();
	  } else {
	    console.log('hidden polygon');
	  }
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
     
      updateFeatures();
      updateRoutes();
      return map;
    }

    function _updateLayers() {
      for(var i in map._layers) {
	if(map._layers[i]._latlng) {
	  if(map._layers[i]._latlng.level) {
	    if(map._layers[i]._latlng.level == map.getLevel()) {
	      if(map._layers[i].setOpacity) {
	        map._layers[i].setOpacity(1);
	      } else if(map._layers[i]._container) {
	        $(map._layers[i]._container).show();
	      }
            } else {
	      if(map._layers[i].setOpacity) {
	        map._layers[i].setOpacity(0);
	      } else if(map._layers[i]._container) {
	        $(map._layers[i]._container).hide();
	      }
	    }
	  }
	}
      }



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
    var levelControlSet = false;
    map.toggleLevelControl = function(flag) {

	    if( levelControl != flag || !levelControlSet ) {
		levelControlSet = true;
		if( flag ) {
		    var level_chooser = $(document.getElementById(element))
			.find(".leaflet-top.leaflet-left .level_chooser[mapInstanceId="+mapInstanceId+"]");
	    	    if(level_chooser.length > 0) 
			level_chooser.remove();
		    else 
			$(document.getElementById(element))
			.find(".leaflet-top.leaflet-left")
			.append('<div id="level_chooser_title" class="level_chooser_title" mapInstanceId="'+mapInstanceId+'" style="font-weight: bold; font-size: 13px; color: #444; text-shadow: 0px 1px 0px white; ' + 
				'margin-left: 10px; margin-top: 10px; margin-bottom: -8px;">Levels</div>');
		    $(document.getElementById(element))
			.find(".leaflet-top.leaflet-left")
			.append('<div class="leaflet-bar level_chooser leaflet-control" mapInstanceId="'+mapInstanceId+'" id="level_chooser"></div>');
		    
		    for(var j=0;j<loadedLevels.length;j++) {
			$('.level_chooser[mapInstanceId='+mapInstanceId+']')
			    .append('<a onmousemove="if(!event) event=window.event;' + 
				    'if( event.cancelBubble ) event.cancelBubble = true;' +
				    'if( event.stopPropagation ) event.stopPropagation(); ' + 
				    'if( event.preventDefault ) event.preventDefault();" ' + 
				    'onclick="if(!event) event = window.event; ' +
				    'if( event.cancelBubble ) event.cancelBubble = true;' +
				    'if( event.stopPropagation ) event.stopPropagation();' + 
				    'if( event.preventDefault ) event.preventDefault();' +
				    'map.setLevel(\'' + loadedLevels[j] + '\');" ' + 
				    'style="font-weight: bold; cursor: hand; text-decoration: none;" ' + 
				    'level="' + loadedLevels[j] + '">' + loadedLevels[j] + '</a>');
		    }
		} else {
		    $('.level_chooser[mapInstanceId='+mapInstanceId+']').remove();
		    $('.level_chooser_title[mapInstanceId'+mapInstanceId+']').remove();
		}
	    }

	    levelControl = flag;
    }
	

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
        lines.levels[i].polyline = new L.MultiPolyline(lines.levels[i].points, options.lineOptions?options.lineOptions:{});
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

    map.__indoor_addLayer = map.addLayer;
    map.addLayer = function(layer) {
      map.__indoor_addLayer(layer);
      updateFeatures();
    }

    var featuresById = {};

    map.getFeatureById = function(id) {
      return featuresById[id];     
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
	url: window.location.protocol+'//navi.indoor.io/navi/maps/'+_.project+'/route.jsonp?'+
	  'lat1='+(p1.lat)+'&lon1='+p1.lon+'&level1='+p1.level+
	  '&lat2='+(p2.lat)+'&lon2='+p2.lon+'&level2='+p2.level+
	  '&callback=?',
	dataType: 'jsonp',
        contentType: 'text/json', 
	processData: false, 
	jsonp: 'callback'
      }).done(function(data) {
	var route = [];
	if(!data) {
	  callback('Error in calculating route');
	  return;
	}
	for(var i in data.features) {
	  var feature = data.features[i];
	  for(var c in feature.geometry.coordinates) {
	    route.push({lng: feature.geometry.coordinates[c][0], 
			lat: feature.geometry.coordinates[c][1], 
			level: feature.properties.level});
	  }
	}

	for(var i in route) {
	  for(var l in levels) {
	    if(route[i].level == levels[l].levelIndex) { 
	      route[i].levelIndex = route[i].level;
	      route[i].l = route[i].level = levels[l].name;
	      break;
	    }
	  }	    
	}
	callback(null, route);
      }).fail(function(data) {
          callback('Server or connection problem. Route could not be calculated.');

      });

    }
   function search(mapid, query, callback) {
            function done(errmsg, result) {
                if( callback ) {
                    try {
                        var cbfun = callback;
                        callback = null;
                        cbfun(errmsg, result);
                    } catch(err) {}
                }
            }

            try {
		var mapid = mapid ? mapid : _.project;
                if( typeof mapid != 'string' ) {
                    done('invalid map id');
                    return;
                }

                if( typeof query == 'function' ) {
                    callbackdone = callback;
                    callback = query;
                    query = {};
                }

                var str = '';
                function parseQuery(obj, prefix) {
                    if( typeof obj == 'object' ) {
                        if( obj instanceof RegExp ) {
                            if( str )
                                str += '&'
                            str += '.' + prefix + '=' + obj.toString();
                        } else
                            for( var ai in obj )
                                parseQuery(obj[ai],
                                           prefix ? prefix + '.' + ai : ai);
                    } else if( typeof obj == 'string' ||
                               typeof obj == 'number' ) {
                        if( str )
                            str += '&';
                        str += '.' + prefix + '=' + obj;
                    }
                }
                parseQuery(query, '');

                $.getJSON(window.location.protocol+'//navi.indoor.io/navi/maps/' + _.project +
                          '/search.jsonp?' + str +
                          '&callback=?')
                    .fail(function(jqXHR, textStatus, errorThrown) {
                        done('error');
                    })
                    .done(function(data, textStatus, jqXHR) {
                        done(null, data)
                    });
            } catch(err) {
                done('error making request');
            }
        }


     var loadedLevels = [];

  map.parseUTFGridData = function(data) {
        var featureIdentifier = data.id ? data.id :
                                data['_featureIdentifier'];
        var properties = {}
        for(var d in data) {
	  if(typeof data[d] == 'string' && data[d].length == 0) continue;
          if(d == 'geometry') continue;
          if(d == '_referenceLocation') {
            var ref_loc = data['_referenceLocation'].split(',');
            properties.markerLocation = new L.LatLng(ref_loc[1], ref_loc[0], "1");
            continue;
          }

          if(d == '_featureIdentifier') {
            properties.featureIdentifier = data['_featureIdentifier'];
            continue;
          }
          properties[d] = data[d];
        }

        var feature = {properties: properties, geometry: JSON.parse(data.geometry),
          levelIndex: data.levelIndex ? data.levelIndex : 0};
	feature.properties.level = map.getLevels()[feature.levelIndex].name;	
        if(feature.geometry.type == 'Polygon') {
          var coords = feature.geometry.coordinates;
          for(var i in coords)
            for(var j in coords[i]) {
              var coord = coords[i][j];
              coords[i][j] = new L.indoor.latLng(coord[1], coord[0], "1");
            }
        }
	return feature;
  }


     $.ajax({
       dataType: 'jsonp',
       jsonp: 'callback',
       url: window.location.protocol+'//tile.indoor.io/export/web/'+_.map+'/'+_.project+'?callback=?'
     }).done(function(project) {
      if(typeof project == 'string') project = JSON.parse(project);
      for(var i in project.levels) {
	if(!routingId) routingId = project.levels[i].source;

        (function(i) { return function() {
 	  loadedLevels.push({});
          $.ajax({
            dataType: 'jsonp',
            jsonp: 'callback',
            url: window.location.protocol+'//tile.indoor.io/api/Tileset/'+project.levels[i].source+'?callback=?'
          }).done((function(index) { return function(data) {
/*            $.ajax({
              dataType: 'jsonp',
              jsonp: 'callback',
              url: window.location.protocol+'//tile.indoor.io/export/web/'+_.map+'/'+project.levels[i].source+'/geojson.json'+'?callback=?'
            }).done(function(geojson) {
*/
	      if(data.bounds[0] == 0 && data.bounds[1] == 0) {
		virtualCoordinates = true;
	      }
	      levels[data.name] = data;
              levels[data.name].levelIndex = parseInt(i);	
	      levelIndex[levels[data.name].levelIndex] = levels[data.name];

	      loadedLevels[index] = data.name;
		var levelCount = 0;
	     for(var j in levels) {
		levelCount++;
	     }
 	    if(levelCount == project.levels.length) {
		loadedLevels.reverse();
		map.toggleLevelControl(levelControl);

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
	      map.setMaxBounds(new L.LatLngBounds(new L.LatLng(data.bounds[1]-(data.bounds[3]-data.bounds[1])/2, 
							       data.bounds[0]-(data.bounds[2]-data.bounds[0])/2), 
						  new L.LatLng(data.bounds[3]+(data.bounds[3]-data.bounds[1])/2, 
							       data.bounds[2]+(data.bounds[2]-data.bounds[0])/2)));
	      map.setView(new L.LatLng(data.center[1], data.center[0]), map.getMinZoom());
	      initialCenterSet = true;
	    }

	
/*          });*/
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
    instance._show = function() {};

    if(instance.options.click) instance._click = function(event) {
      event.latLng.level = map.getLevel();
      if(event.data && event.data['_featureIdentifier']) {
        event.feature = map.parseUTFGridData(event.data);
        delete event.data;    
      }
      this.options.click(event);
    };
    if(instance.options.hover) instance._mousemove = function(event) {
      event.latLng.level = map.getLevel();
      if(event.data && event.data['_featureIdentifier']) {
	event.feature = map.parseUTFGridData(event.data);
	delete event.data;
      }
      this.options.hover(event);  
    };
    return instance;
  }
  
};



$(document).trigger('indoorjs');
