class LeafletMap {

  /**
   * Class constructor with basic configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data, _colorCol) {
    this.config = {
      parentElement: _config.parentElement,
    }
    this.unmappedCount = _data.filter(d => d.unmapped === true).length;
    this.stUrl = 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.{ext}';
    this.data = _data;
    this.colorCol = _colorCol;
    this.drawnFeatures = new L.FeatureGroup();
    this.initVis();
  }
  
  /**
   * We initialize scales/axes and append static elements, such as axis titles.
   */
  initVis() {
    let vis = this;
    //Stamen Terrain
    vis.stUrl = 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.{ext}';
    vis.stAttr = 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

    //this is the base map layer, where we are showing the map background
    vis.base_layer = L.tileLayer(vis.stUrl, {
      id: 'st-image',
      attribution: vis.stAttr,
      ext: 'png'
    });

    vis.theMap = L.map('mapDiv', {
      center: [39.1, -84.5],
      zoom: 12,
      layers: [vis.base_layer],
    });

    vis.theMap.addLayer(vis.drawnFeatures);

    let drawControl = new L.Control.Draw({
        // position: "topright",
        edit: {
            featureGroup: vis.drawnFeatures,
            remove: true
        },
        draw: {
          polyline: false,
          circle: false,
          circlemarker: false,
          marker: false,
          polygon: {
            shapeOptions: {
              color: '#ff0000'
            },
          },
          rect: {
            shapeOptions: {
              color: '#00ff00'
            },
          },
		   },
 
    });
    vis.theMap.addControl(drawControl);

    vis.theMap.on("draw:created", function(e){
        vis.drawnFeatures.addLayer(e.layer);
        vis.filterToPointsInPolygon(vis.drawnFeatures.getLayers());
    });

    vis.theMap.on("draw:edited", function(e){
        vis.filterToPointsInPolygon(vis.drawnFeatures.getLayers());
    });

    vis.theMap.on("draw:deleted", function(e){
      vis.filterToPointsInPolygon(vis.drawnFeatures.getLayers());
    });

    //default starting color
    vis.colorValue = d => d.category;
    vis.colorScale = d3.scaleOrdinal()
      .range(d3.schemePaired) 
      .domain(["Accessibility", "Public Health", "Transportation & Engineering", "Public Services", "Police", "Buildings and Inspections", "City Admin", "Sewer and water", "Schools, parks, recreation", "Rentals", "Other"])

    //initialize svg for d3 to add to map
    L.svg({clickable:true}).addTo(vis.theMap)// we have to make the svg layer clickable
    vis.overlay = d3.select(vis.theMap.getPanes().overlayPane)
    vis.svg = vis.overlay.select('svg').attr("pointer-events", "auto")

    //NOTE: keep this in initVis so we don't have to keep rendering circles over and over, only updating
    vis.Dots = vis.svg.selectAll('circle')
      .data(vis.data) 
      .join('circle')
          .attr("fill", d => vis.colorScale(vis.colorValue(d)))
          .attr("cx", d => vis.theMap.latLngToLayerPoint([d.latitude,d.longitude]).x)
          .attr("cy", d => vis.theMap.latLngToLayerPoint([d.latitude,d.longitude]).y) 
          .attr("r", 3)
          .attr('class', d => {
            if(d.filtered === true){
              return 'filtered'
            }else{
              return ''
            }
          })
          .on('mouseover', function(event,d) { //function to add mouseover event
            if(d.filtered === false){
              d3.select(this).transition() //D3 selects the object we have moused over in order to perform operations on it
                .duration('150') //how long we are transitioning between the two states (works like keyframes)
                .attr('r', 4) //change radius
                .attr("stroke", "black");

              //create a tool tip
              d3.select('#tooltip')
              .style('left', (event.pageX + 10) + 'px')   
              .style('top', (event.pageY + 10) + 'px')
              .style('display', 'block')
                // Format number with million and thousand separator
              .html(`<div class="tooltip-label">Requested Date: </div><div class="tooltip">${d.requested_date}</div></br>
                    <div class="tooltip-label">Updated Date: </div><div class="tooltip">${d.updated_date}</div></br>
                    <div class="tooltip-label">Public Agency: </div><div class="tooltip">${d.agency_responsible}</div></br>
                    <div class="tooltip-label">Service Details: </div><div class="tooltip">${d.service_name}</div></br>
                    <div class="tooltip-label">Service Description: </div><div class="tooltip">${d.description || "None"}</div></br>`);
            }
          })
          .on('mousemove', (event) => {
              d3.select('#tooltip')
                .style('left', (event.pageX + 10) + 'px')   
                .style('top', (event.pageY + 10) + 'px');
            })              
          .on('mouseleave', function() {
              d3.select(this).transition() //D3 selects the object we have moused over in order to perform operations on it
                .duration('150') //how long we are transitioning between the two states (works like keyframes)
                .attr("fill", d => vis.colorScale(vis.colorValue(d))) //change the fill
                .attr('r', 3) //change radius
                .attr("stroke", "none")
              
              d3.select('#tooltip')
              .style('display', "none")
            })
          .on('click', (event, d) => { //experimental feature I was trying- click on point and then fly to it
              vis.newZoom = vis.theMap.getZoom()+2;
              if( vis.newZoom > 16)
                vis.newZoom = 16;
              vis.theMap.flyTo([d.latitude, d.longitude], vis.newZoom);
            });
    
    //handler here for updating the map, as you zoom in and out           
    vis.theMap.on("zoomend", function(){
      vis.updateVis();
    });
  }

  updateVis() {
    let vis = this;

    //clear old legend 
    d3.selectAll("#mapLegend > *").remove();

    //Create legend
    vis.legendSvg = d3.select("#mapLegend")
      .append("svg")
      .attr("width", 300)
      .attr("height", 200);

    // Add legend title for coloring
    vis.legendSvg.append('text')
      .attr('class', 'axis-title')
      .attr('x', 5)
      .attr('y', 5)
      .attr('dy', '.71em')
      .style('font-weight', 'bold')
      .text('Color legend');

    //TODO source: https://cagis.hamilton-co.org/311/
    if(vis.colorCol == "color_callType"){
      vis.colorValue = d => d.category;
      vis.colorScale = d3.scaleOrdinal()
        .range(d3.schemePaired) 
        .domain(["Accessibility", "Public Health", "Transportation & Engineering", "Public Services", "Police", "Buildings and Inspections", "City Admin", "Sewer and water", "Schools, parks, recreation", "Rentals", "Other"])  
      vis.legendCat = ["Accessibility", "Public Health", "Transportation & Engineering", "Public Services", "Police", "Buildings and Inspections", "City Admin", "Sewer and water", "Schools, parks, recreation", "Rentals", "Other"];
    
        // Add one dot in the legend for each star
      vis.legendSvg.selectAll("legendDots")
        .data(vis.legendCat)
        .enter()
      .append("circle")
        .attr("cx", 10)
        .attr("cy", function(d,i){ return 25 + i*12}) // 25 is where the first dot appears. 10 is the distance between dots
        .attr("r", 5)
        .style("fill", d => vis.colorScale(d))
      
      vis.legendSvg.selectAll("legendText")
          .data(vis.legendCat)
          .enter()
        .append("text")
          .attr("x", 30)
          .attr("y", function(d,i){ return 25 + i*12}) // 25 is where the first dot appears. 10 is the distance between dots
          .text(d => d)
          .attr("text-anchor", "left")
          .style("alignment-baseline", "middle")
          .style("font-weight", "bold")
    }
    else if (vis.colorCol == "color_timeBetween"){
      vis.colorValue = d => d.days_between;
      vis.colorScale = d3.scaleLinear()
        .range(["white", "#023020"])
        .domain(d3.extent(vis.data, vis.colorValue))
      vis.legendCat = Array.from({length: 20}, (x, i) => i);
      vis.legendScale = d3.scaleLinear().range(["white", "#023020"]).domain([0,20]);

      // Add one dot in the legend for each star
      vis.legendSvg.selectAll("legendBar")
        .data(vis.legendCat)
        .enter()
      .append("rect")
        .attr("x", function(d,i){ return 25 + i*10})
        .attr("y", 25)
        .attr("width", 10)
        .attr("height", 20)
        .style("fill", d => vis.legendScale(d))
      
      vis.legendSvg.append('text')
        .attr('x', 25)
        .attr('y', 50)
        .attr('dy', '.71em')
        .text('0 days -> 53 days');
  
    }
    else if (vis.colorCol == "color_daysInYear"){
      vis.colorValue = d => new Date(d.requested_date);
      vis.colorScale = d3.scaleLinear()
        .range(["white", "#023020"])
        .domain(d3.extent(vis.data, vis.colorValue))
      vis.legendCat = Array.from({length: 20}, (x, i) => i);
      vis.legendScale = d3.scaleLinear().range(["white", "#023020"]).domain([0,20])

      // Add one dot in the legend for each star
      vis.legendSvg.selectAll("legendBar")
        .data(vis.legendCat)
        .enter()
      .append("rect")
        .attr("x", function(d,i){ return 25 + i*10})
        .attr("y", 25)
        .attr("width", 10)
        .attr("height", 20)
        .style("fill", d => vis.legendScale(d))
      
      vis.legendSvg.append('text')
        .attr('x', 25)
        .attr('y', 50)
        .attr('dy', '.71em')
        .text('1/1/2022 -> 12/31/2022');
    }
    else if (vis.colorCol == "color_publicAgency"){
      vis.colorValue = d => d.agency_with_other;
      vis.colorScale = d3.scaleOrdinal()
        .range(d3.schemePaired) 
        .domain(d3.extent(vis.data, vis.colorValue))
      vis.legendCat = ["Fire Dept", "Cin Water Works", "Park Department", "Police Department", "City Manager's Office", "Dept of Trans and Eng", "Cinc Health Dept", "Cinc Building Dept", "Public Services", "Other"];

      // Add one dot in the legend for each star
      vis.legendSvg.selectAll("legendDots")
        .data(vis.legendCat)
        .enter()
      .append("circle")
        .attr("cx", 10)
        .attr("cy", function(d,i){ return 25 + i*12}) // 25 is where the first dot appears. 10 is the distance between dots
        .attr("r", 5)
        .style("fill", d => vis.colorScale(d))
      
      vis.legendSvg.selectAll("legendText")
          .data(vis.legendCat)
          .enter()
        .append("text")
          .attr("x", 30)
          .attr("y", function(d,i){ return 25 + i*12}) // 25 is where the first dot appears. 10 is the distance between dots
          .text(d => d)
          .attr("text-anchor", "left")
          .style("alignment-baseline", "middle")
          .style("font-weight", "bold")
    }
   
   //redraw based on new zoom and filter status - need to recalculate on-screen position
    vis.Dots
      .data(vis.data)
      .attr("cx", d => vis.theMap.latLngToLayerPoint([d.latitude, d.longitude]).x)
      .attr("cy", d => vis.theMap.latLngToLayerPoint([d.latitude, d.longitude]).y)
      .attr("fill", d => vis.colorScale(vis.colorValue(d)))
      .attr("r", 3)
      .attr('class', d => {
        if(d.filtered === true){
          return 'filtered'
        }else{
          return ''
        }
      });
    }
    
    updateBaseTile(newTile){
      let vis = this;
      vis.stUrl = newTile;
  
      // Updating the tiling of the map base layer
      vis.theMap.removeLayer(vis.base_layer);
      //this is the base map layer, where we are showing the map background
      vis.base_layer = L.tileLayer(vis.stUrl, {
        id: 'st-image',
        attribution: vis.stAttr,
        ext: 'png'
      });
      vis.theMap.addLayer(vis.base_layer);
    }
  
  renderVis() {
    let vis = this;
  }

  filterToPointsInPolygon(polys) {
    let allPolygons = [];
    polys.map(poly => {
      let geoPoly = poly.toGeoJSON();
      allPolygons.push(turf.polygon([geoPoly.geometry.coordinates[0]]));
    });
    data.map(d => {
      let numInside = allPolygons.length; // assume point is inside of all polys at first
      // console.log("inside" + numInside + " to start")
      allPolygons.map(parentPolygon => {
        let point = turf.point([d.longitude, d.latitude]);
        if (!turf.inside(point, parentPolygon)){
          numInside -= 1; // remove 1 from count if the point is not within a specific poly
        }
      });
      if(numInside > 0){ // in at least 1 polygon
        d.insidePolygon = true;
      }else{
        d.insidePolygon = false;
      }
    })
    filterData();
  };
}