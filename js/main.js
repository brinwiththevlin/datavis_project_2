// GLOBAL VARIABLES
let data;
let leafletMap;
let globalDataFilter = [];
let filterableVisualizations = [];
//-------------------------//

d3.dsv("|","/data/cincy311_cleaned.tsv")
  .then(_data =>{
    data = _data;
    console.log('Data loading complete. Work with dataset.');
        
    parseTime = d3.timeParse("%Y-%m-%d")
    //process the data
    data.forEach(d => {
      let requested_parse = parseTime(d.requested_date)
      //TODO confirm that replace method doesn't remove " from that is not leading or trailing
      d.service_name = (d.service_name).replace(/(^"|"$)/g, "").trim(); //service_name - remove quotes
      d.service_code = (d.service_code).replace(/(^"|"$)/g, "").trim(); //service_code - remove quotes
      d.description = (d.description).replace(/(^"|"$)/g, "").trim(); //description - remove quotes

      d.requested_date = d3.timeFormat("%m/%d/%Y")(requested_parse); //requested_datetime - convert to D3 datetime
      d.updated_date = d3.timeFormat("%m/%d/%Y")(parseTime(d.updated_date)); //updated_datetime - convert to D3 datetime
      d.expected_date = d3.timeFormat("%m/%d/%Y")(parseTime(d.expected_date)); //expected_datetime - convert to D3 datetime
      d.address = (d.address).replace(/(^"|"$)/g, "").trim(); //address - remove quotes
      d.latitude = +d.latitude; //latitude - convert to number
      d.longitude = +d.longitude; //longitude - convert to number

      // Derived properties
      d.requested_day = d3.timeFormat("%a")(requested_parse);
      d.requested_week = d3.timeFormat("%U")(requested_parse);
      d.filtered = false;
      if(isNaN(d.latitude) || isNaN(d.longitude) || d.latitude == 0 || d.longitude == 0){
        d.unmapped = true;
      }else{
        d.unmapped = false;
      }
    })

    //Plot map
    leafletMap = new LeafletMap({ parentElement: '#mapDiv'}, data, null);
    leafletMap.updateVis();

    heatMap = new HeatMap({ parentElement: '#heatTimeDiv'}, data, null);
    heatMap.updateVis();
    callsByWeekDay = new Barchart({
      parentElement: '#callsByWeekDay',
      }, data, "requested_day", "Calls By Week Day", "Week Day", "Number of Calls", 30);
    callsByWeekDay.updateVis();

    filterableVisualizations = [leafletMap, callsByWeekDay];
    filterData(); // initializes filteredData array (to show count on refresh)
    // console.log(data)
  })
.catch(error => {
    console.log(error);
});

function updateMapMarkerColor(val){
  if (val == "color_callType"){
    //leafletMap.colorVar = "service_code";
    //TODO figure out how to group categories - currently like 900 (ahhhh)
    //leafletMap.updateVis();
  }
  else if (val == "color_timeBetween"){
    //TODO finish
  }
  else if (val == "color_daysInYear"){
    //TODO finish
  }
  else if (val == "color_publicAgency"){
    //leafletMap.colorVar = "AGENCY_RESPONSIBLE";
    //TODO figure out how to group categories - currently like 900 (ahhhh)
    //leafletMap.updateVis();
  }
}

function updateMapBackground(val){
  if (val == "default"){
    leafletMap.updateBaseTile('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.{ext}');
  }
  else if (val == "color"){
    leafletMap.updateBaseTile('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png');
  }
  else if (val == "streets"){
    leafletMap.updateBaseTile('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png');
  }
  else if (val == "dark"){
    leafletMap.updateBaseTile('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png');
  }
  else if (val == "gray"){
    leafletMap.updateBaseTile('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png');
  }
}

function filterData(resetBrush = false) {
	let filteredData = data;
	if (globalDataFilter.length == 0) {
		filterableVisualizations.forEach(v => {
			v.data = data;
		})
	} else {
		filterableVisualizations.forEach(v => {
			filteredData = data.map(d => {
				for (i in globalDataFilter){
					let attrFilter = globalDataFilter[i]
					if(attrFilter[0] === "requested_date"){
						if((d[attrFilter[0]] > attrFilter[1][1] || d[attrFilter[0]] < attrFilter[1][0]) && attrFilter[1][1] !== attrFilter[1][0]){
							return {...d, filtered: true}
						}
					}else{
						if(!attrFilter[1].includes(d[attrFilter[0]]) && attrFilter[1].length > 0){
							return {...d, filtered: true}
						}
					}
				}
				return {...d, filtered: false}
			})
			v.data = filteredData;
		})
	}
	d3.select(".dataCount").text(filteredData.filter(d => !d.filtered).length + " / " + data.length)
	filterableVisualizations.forEach(v => {
		if(v.aggregateAttr === "???"){ // for histograms
			v.updateVis(nBins);
		}else{
			v.updateVis(resetBrush);
		}
	})
}

function clearFilters(){
	globalDataFilter = [];
	filterData(resetBrush=true);
}