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
    //process the data

    parseTime = d3.timeParse("%Y-%m-%d")
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
      d.days_between =  Math.trunc((new Date(d.updated_date).getTime() - new Date(d.requested_date).getTime()) / (1000 * 3600 * 24))
      d.category = this.serviceNameCategories(d);
      d.agency_with_other = this.agencyResponsibleOther(d);
      d.weekday_requested = d3.timeFormat("%a")(requested_parse);
      d.week_requested = d3.timeFormat("%U")(requested_parse);
      d.filtered = false;
      if(isNaN(d.latitude) || isNaN(d.longitude) || d.latitude == 0 || d.longitude == 0){
        d.unmapped = true;
      }else{
        d.unmapped = false;
      }
    })

    //Plot map
    leafletMap = new LeafletMap({ parentElement: '#mapDiv'}, data, "color_callType");

    //update unmapped data count
    let unmappedCount = data.filter(d => d.unmapped === true).length
    d3.select("#unmappedCall").text("# of Calls Not Displayed: "+ unmappedCount)


    callsByWeekDay = new Barchart({
      parentElement: '#callsByWeekDay',
      }, data, "weekday_requested", "Calls By Week Day", "Week Day", "Number of Calls", 30);

    requestReceivedUpdated = new Histogram({
      parentElement: '#requestReceivedUpdated',
    }, data, "days_between", "Days Between Call Received and Issue Updated", "Days Between Dates", "Number of Calls")
    requestReceivedUpdated.updateVis(10);

    filterableVisualizations = [leafletMap, callsByWeekDay];
    filterData(); // initializes filteredData array (to show count on refresh)
  })
.catch(error => {
    console.log(error);
});

function serviceNameCategories(d){
  
  //cat1 - Accessibility
  cat1Keys = ["ada compliant, city of cinti", "curb ramp, new/enhance", "handrails, repair", "request an accomodation, coc",
  "signal, audible signal repair", "sidewalk, obstructions", "general accessibility"]
  
  //cat2 - Public Health
  cat2Keys = ["mold", "roach", "mice", "rats", "animal", "mosquitoes", "flea", 
  "food borne", "food service", "bed bugs", "racoon", "bats", "COVID-19", "rodent", "insect", "wasp, bee hive removal",
  "food operation"]

  //cat3 - Transportation & Engineering
  cat3Keys = ["speed humps", "sidewalk", "pavement markings", "traffic island repair", "bike rack", "street", "odot", 
  "misc traffc study cnt/accident", "encroachment", "parking meter", "light", "sign", "sunken area, repair",
  "bridge", "default, dote", "wall, repair problem near str", "benches, repair/remove row", "constructn, build w/o permit",
  "other rsp permit request", "dote", "guardrail", "build, permit vio dur const er", "contruct/contract complnt row"]

  //cat4 - Public Services
  cat4Keys = ["damage claim - trod", "beautification request", "street sweeping", "street cleaning", "yard waste", 
  "recycling", "dumping", "trash cart", "graffiti", "corner can", "dead animal", "unsanitary condtn", "park graffiti", 
  "service complaint", "row tire dumping", "row furniture/trash dumping", "dead animal", "curbs", "fence", 
  "pothole", "landslide", "slippery streets", "steps", "barricade", "bikeway", "litter", "general repair", 
  "spec collectn", "special collection", "nod", "vehicle", "open burning", "trash, ", "trash can, condemned",
  "dumpster, overflow row haz", "bicycle, abandoned"]

  //cat5 - Police
  cat5Keys = ["grass front yd res", "police", "default, parking", "parking, prob at com facility", "bicyclist incident report"] 

  //cat6 - Buildings and Inspections
  cat6Keys = ["housing", "land/use", "construction signage", "construction", "life safety 6month inspection", 
  "annual - c annual insp", "elevator", "special fire inspection",
  "restaurant consult, new lic", "carbon monoxide test, req", "food operation, request gen", 
  "relocation request", "tree", "tall grass/weeds", "weeds", "zoning", 
  "fire prevention inspec request", "healthy homes, inspection", "inspection", "lot vacant", "req for insp", "fire door"]

  //cat7 - City Admin
  cat7Keys = ["constituent affairs inquiry", "default, city", "missing property, collections", "service recognition", 
  "service compliment", "information request", "home ownership survey", "relocation survey request"]

  //cat8 - Sewer and water
  cat8Keys = ["sewage", "septic", "manhole cvr/sewer lid", "inlets", "water", "fire hydrant, repair", "sewer", "default, msd",
  "default, cww", "restoration, repair cww", "customer inquiry, gcww"]

  //cat9 - Schools, parks, recreation
  cat9Keys = ["playground equipment problem", "school, bathroom stalls, soap", "park facility problem", "school", 
  "default, parks", "default, recreation", "hiking trail issue", "drinking fountain problem", "park trash can overflowing",
  "park light issues"]

  //cat10 - Rentals
  cat10Keys = ["building", "plumbing, defective", "smoke detector, missing/damagd", "unsanitary living conditions", 
  "short term rental", "heat, no heat hazard"]

  let str = d.service_name.toLowerCase()
  // Checks whether an element is within the cat1Keys
  const dataIncludes = (element) => str.includes(element);
  if (cat1Keys.some(dataIncludes)){
    return "Accessibility";
  }
  else if (cat2Keys.some(dataIncludes)){
    return "Public Health";
  }
  else if (cat3Keys.some(dataIncludes)){
    return "Transportation & Engineering";
  }
  else if (cat4Keys.some(dataIncludes)){
    return "Public Services";
  }
  else if (cat5Keys.some(dataIncludes)){
    return "Police";
  }
  else if (cat6Keys.some(dataIncludes)){
    return "Buildings and Inspections";
  }
  else if (cat7Keys.some(dataIncludes)){
    return "City Admin";
  }
  else if (cat8Keys.some(dataIncludes)){
    return "Sewer and water";
  }
  else if (cat9Keys.some(dataIncludes)){
    return "Schools, parks, recreation";
  }
  else if (cat10Keys.some(dataIncludes)){
    return "Rentals";
  }
  else{
    return "Other";
  }
  
}

function agencyResponsibleOther(d){
  //console.log(d.agency_responsible)
  //let agencies = ["Fire Dept", "Cin Water Works", "Park Department", "Police Department", "City Manager's Office", "Dept of Trans and Eng", "Cinc Health Dept", "Cinc Building Dept", "Public Services"];
  let agencies_other = ["Law Department", "Community Development", "Metropolitan Sewer", "Cincinnati Recreation", "Enterprise Services", "Regional Computer Center", "Treasury Department"];
  if (agencies_other.includes(d.agency_responsible)){
    return "Other";
  }
  return d.agency_responsible
}

function updateMapMarkerColor(val){
  leafletMap.colorCol = val;
  leafletMap.updateVis();
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