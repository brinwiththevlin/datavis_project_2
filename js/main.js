let leafletMap; //global variable

console.log("Start of code")

d3.dsv("|","/data/cincy311_cleaned.tsv")
  .then(data =>{
    console.log('Data loading complete. Work with dataset.');
        
    parseTime = d3.timeParse("%Y-%m-%d")
    //process the data
    data.forEach(d => {
      //TODO confirm that replace method doesn't remove " from that is not leading or trailing
      d.service_name = (d.service_name).replace(/(^"|"$)/g, "").trim(); //service_name - remove quotes
      d.service_code = (d.service_code).replace(/(^"|"$)/g, "").trim(); //service_code - remove quotes
      d.description = (d.description).replace(/(^"|"$)/g, "").trim(); //description - remove quotes
      d.requested_day = d3.timeFormat("%a")(parseTime(d.requested_datetime));
      d.requested_week = d3.timeFormat("%U")(parseTime(d.requested_datetime));
      d.requested_datetime = d3.timeFormat("%m/%d/%Y")(parseTime(d.requested_datetime)); //requested_datetime - convert to D3 datetime
      d.updated_datetime = d3.timeFormat("%m/%d/%Y")(parseTime(d.updated_datetime)); //updated_datetime - convert to D3 datetime
      d.expected_datetime = d3.timeFormat("%m/%d/%Y")(parseTime(d.expected_datetime)); //expected_datetime - convert to D3 datetime
      d.address = (d.address).replace(/(^"|"$)/g, "").trim(); //address - remove quotes
      d.latitude = +d.latitude; //latitude - convert to number
      d.longitude = +d.longitude; //longitude - convert to number
    })

    //Plot map
    leafletMap = new LeafletMap({ parentElement: '#mapDiv'}, data, null);
    heatMap = new HeatMap({ parentElement: '#heatTimeDiv'}, data, null);



    console.log(data)
  })
.catch(error => {
    // console.error('Error loading the data');
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