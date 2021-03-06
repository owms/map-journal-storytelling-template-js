define(["./alertwhere-data"], function (awData) {

  // bpoteat: borrowed this from here:
  // https://gist.github.com/onderaltintas/6649521
  var degrees2meters = function (lon, lat) {
    var x = lon * 20037508.34 / 180;
    var y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);
    y = y * 20037508.34 / 180;
    return [x, y]
  };

  function getExtent(position) {
    if (!position) {
      return null;
    }
    var coords;
    if (Array.isArray(position))
      coords = position;
    else
      coords = position.split(',');


    // this is a hack to just get us to a reasonable zoom level around the point of the position
    var min = degrees2meters(parseFloat(coords[0]) - 1, parseFloat(coords[1]) - 1);
    var max = degrees2meters(parseFloat(coords[0]) + 1, parseFloat(coords[1]) + 1);

    return {
      "xmin": min[0],
      "ymin": min[1],
      "xmax": max[0],
      "ymax": max[1],
      "spatialReference": {"wkid": 102100}
    };
  }

  function getContent(id) {
    var data = awData.data(id);
    var sections = [];
    $.each(data, function (index, section) {

      var sectionData = {
        "title": `<p><strong><span style=\"font-size:36px\">${section.title}</span></strong></p>\n`,
        "content": `<p>${section.description}</p>\n`,
        "contentActions": [],
        // not sure what these dates are used for (they don't show anywhere in the content) but it errors
        // without them, so...
        "creaDate": 1465324793581,
        "pubDate": 1465324793581,
        "status": "PUBLISHED",
        "media": {
          "type": "webmap",
          "webmap": {
            "id": "180c4bd65bde4e9dbeed537e82bbaba6",
            "extent": getExtent(section.location)
          }
        }
      };
      sections.push(sectionData);
    });

    var storyData = {
      "item": {
        "title": "OW/BlackSky Story Map",
        "extent": [],
      },
      "itemData": {
        "values": {
          "settings": {
            "layout": {
              // This can be either "side" or "float" for how the output should be arranged.
              "id": "side"
            }
          },
          "story": {
            "storage": "WEBAPP",
            // This is where the real content is defined. Each object in the sections array defins
            "sections": sections
          },
          // This doesn't seem to be important but it seems like it could be used for something
          "title": "OW Test 2 - TITLE!!\n"
        }
      }
    };

    return storyData;
  }

  function getMap(id) {
    var data = awData.data(id);
    var layers = [];
    $.each(data, function (index, section) {
      var coords;
      if (Array.isArray(section.location))
        coords = section.location;
      else
        coords = section.location.split(',');
      var position = degrees2meters(parseFloat(coords[0]), parseFloat(coords[1]));
      var layer = {
        "layerDefinition": {
          "type": "Feature Layer",
          "drawingInfo": {
            "renderer": {
              "field1": "TYPEID",
              "type": "uniqueValue",
              "uniqueValueInfos": [
                {
                  "symbol": {
                    "height": 36,
                    "width": 36,
                    "xoffset": 0,
                    "yoffset": 12,
                    "contentType": "image/png",
                    "type": "esriPMS",
                    // I'm guessing this is where we would stick our own icon.
                    "url": "http://static.arcgis.com/images/Symbols/Basic/GreenStickpin.png"
                  },
                  "value": "0",
                  "label": "Stickpin"
                }
              ]
            }
          },
          "fields": [
            {
              "alias": "OBJECTID",
              "name": "OBJECTID",
              "type": "esriFieldTypeOID",
              "editable": false
            }
          ],
        },
        "popupInfo": {
          // The title and description will be both be inserted as html into the popup for the point marker.
          "title": section.title,
          "description": `<h2>${section.locationName ? section.locationName : ""}</h2><a href="${section.url}" target="_blank">Click for article</a>`
        },

        "featureSet": {
          "geometryType": "esriGeometryPoint",
          "features": [{
            "geometry": {
              // The actual point for the item.
              "x": position[0],
              "y": position[1],

              "spatialReference": {
                "wkid": 102100,
                "latestWkid": 3857
              }
            },
            "attributes": {
              "VISIBLE": 1,
              "TITLE": section.title,
              "TYPEID": 0,
              "OBJECTID": index
            }
          }]
        },
      };

      layers.push(layer);
    });

    var mapData = {
      "item": {
        // doesn't matter what value this is but it has to be a 32 character guid.
        "id": "180c4bd65bde4e9dbeed537e82bbaba6",
        "title": "OW Test 2 - Map",

        // the default zoom extent for the map.
        "extent": null,
      },
      "itemData": {
        "baseMap": {
          "baseMapLayers": [
            {
              "type": "OpenStreetMap",
              "layerType": "OpenStreetMap",
              "opacity": 1,
              "visibility": true,
              "id": "OpenStreetMap"
            }
          ],
          "title": "OpenStreetMap"
        },
        "spatialReference": {
          "wkid": 102100,
          "latestWkid": 3857
        },
        "operationalLayers": [
          {
            "featureCollection": {
              "layers": layers,
              "showLegend": false
            },
            "opacity": 1,
            "visibility": true
          }
        ],
      }
    };

    return mapData;
  }

  return {
    getStoryData: getContent,
    getMapData: getMap
  };
});
