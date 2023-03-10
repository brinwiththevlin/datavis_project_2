let leafletMap; //global variable

console.log("Start of code")

d3.dsv("|","/data/cincy311_cleaned.tsv")
  .then(data =>{
    console.log('Data loading complete. Work with dataset.');
        
    //process the data
    data.forEach(d => {
      //TODO confirm that replace method doesn't remove " from that is not leading or trailing
      d.service_name = (d.service_name).replace(/(^"|"$)/g, "").trim(); //service_name - remove quotes
      d.service_code = (d.service_code).replace(/(^"|"$)/g, "").trim(); //service_code - remove quotes
      d.description = (d.description).replace(/(^"|"$)/g, "").trim(); //description - remove quotes
      //d.REQUESTED_DATETIME = parseTime(d.REQUESTED_DATETIME); //REQUESTED_DATETIME - convert to D3 datetime
      //d.UPDATED_DATETIME = parseTime(d.UPDATED_DATETIME); //UPDATED_DATETIME - convert to D3 datetime
      //d.EXPECTED_DATETIME = parseTime(d.EXPECTED_DATETIME); //EXPECTED_DATETIME - convert to D3 datetime
      d.address = (d.address).replace(/(^"|"$)/g, "").trim(); //address - remove quotes
      d.latitude = +d.latitude; //latitude - convert to number
      d.longitude = +d.longitude; //longitude - convert to number
    })

    //Plot map
    leafletMap = new LeafletMap({ parentElement: '#mapDiv'}, data, null);



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