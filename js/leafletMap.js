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
    this.data = _data;
    this.colorCol = _colorCol;
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
      layers: [vis.base_layer]
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

    //these are the city locations, displayed as a set of dots 
    vis.Dots = vis.svg.selectAll('circle')
      .data(vis.data) 
      .join('circle')
          .attr("fill", d => vis.colorScale(vis.colorValue(d))) 
          .attr("stroke", "black")
          .attr("cx", d => vis.theMap.latLngToLayerPoint([d.latitude,d.longitude]).x)
          .attr("cy", d => vis.theMap.latLngToLayerPoint([d.latitude,d.longitude]).y) 
          .attr("r", 3)
          .on('mouseover', function(event,d) { //function to add mouseover event
              d3.select(this).transition() //D3 selects the object we have moused over in order to perform operations on it
                .duration('150') //how long we are transitioning between the two states (works like keyframes)
                .attr("fill", "red") //change the fill
                .attr('r', 4); //change radius

              //create a tool tip
              d3.select('#tooltip')
                  .style('opacity', 1)
                  .style('z-index', 1000000)
                    // Format number with million and thousand separator
                  .html(`<div class="tooltip-label">Call received: ${d.REQUESTED_DATETIME}</div><p>${d.DESCRIPTION}</p>`);

            })
          .on('mousemove', (event) => {
              //position the tooltip
              d3.select('#tooltip')
                .style('left', (event.pageX + 10) + 'px')   
                .style('top', (event.pageY + 10) + 'px');
            })              
          .on('mouseleave', function() { //function to add mouseover event
              d3.select(this).transition() //D3 selects the object we have moused over in order to perform operations on it
                .duration('150') //how long we are transitioning between the two states (works like keyframes)
                .attr("fill", d => vis.colorScale(vis.colorValue(d))) //change the fill
                .attr('r', 3) //change radius

              d3.select('#tooltip').style('opacity', 0);//turn off the tooltip

            })
          .on('click', (event, d) => { //experimental feature I was trying- click on point and then fly to it
              // vis.newZoom = vis.theMap.getZoom()+2;
              // if( vis.newZoom > 18)
              //  vis.newZoom = 18; 
              // vis.theMap.flyTo([d.latitude, d.longitude], vis.newZoom);
            });
    
    //handler here for updating the map, as you zoom in and out           
    vis.theMap.on("zoomend", function(){
      vis.updateVis();
    });

  }

  updateVis() {
    let vis = this;

    if(vis.colorCol == "color_callType"){
      vis.colorValue = d => d.category;
      vis.colorScale = d3.scaleOrdinal()
        .range(d3.schemePaired) 
        .domain(["Accessibility", "Public Health", "Transportation & Engineering", "Public Services", "Police", "Buildings and Inspections", "City Admin", "Sewer and water", "Schools, parks, recreation", "Rentals", "Other"])  
    }
    else if (vis.colorCol == "color_timeBetween"){
      vis.colorValue = d => d.days_between;
      vis.colorScale = d3.scaleOrdinal()
        .range(d3.schemePaired) 
        .domain(d3.extent(vis.data, vis.colorValue))

    }
    else if (vis.colorCol == "color_daysInYear"){
      //TODO finish
    }
    else if (vis.colorCol == "color_publicAgency"){
      vis.colorValue = d => d.days_between;
      vis.colorScale = d3.scaleOrdinal()
        .range(d3.schemePaired) 
        .domain(d3.extent(vis.data, vis.colorValue))
    }




    //want to see how zoomed in you are? 
    // console.log(vis.map.getZoom()); //how zoomed am I
    
    //want to control the size of the radius to be a certain number of meters? 
    vis.radiusSize = 3; 

    // if( vis.theMap.getZoom > 15 ){
    //   metresPerPixel = 40075016.686 * Math.abs(Math.cos(map.getCenter().lat * Math.PI/180)) / Math.pow(2, map.getZoom()+8);
    //   desiredMetersForPoint = 100; //or the uncertainty measure... =) 
    //   radiusSize = desiredMetersForPoint / metresPerPixel;
    // }
   
   //redraw based on new zoom- need to recalculate on-screen position
    vis.Dots
      .attr("cx", d => vis.theMap.latLngToLayerPoint([d.latitude,d.longitude]).x)
      .attr("cy", d => vis.theMap.latLngToLayerPoint([d.latitude,d.longitude]).y)
      .attr("r", vis.radiusSize) 
      .attr("fill", d => vis.colorScale(vis.colorValue(d)));

  }


  renderVis() {
    let vis = this;

    //not using right now... 
 
  }


}