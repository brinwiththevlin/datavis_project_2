let leafletMap; //global variable

console.log("Start of code")
// const dispatcher = d3.dispatch('filterCategories');
let data;
let planetFilter = [];

const parseTime = d3.timeParse("%Y-%m-%d");

d3.tsv('/data/Cincy311_2022_final.tsv')
  .then(data => {
  	console.log('Data loading complete. Work with dataset.');
        
    //process the data
    data.forEach(d => {
      //TODO confirm that replace method doesn't remove " from that is not leading or trailing
      d.SERVICE_NAME = (d.SERVICE_NAME).replace(/(^"|"$)/g, "").trim(); //SERVICE_NAME - remove quotes
      d.SERVICE_CODE = (d.SERVICE_CODE).replace(/(^"|"$)/g, "").trim(); //SERVICE_CODE - remove quotes
      d.DESCRIPTION = (d.DESCRIPTION).replace(/(^"|"$)/g, "").trim(); //DESCRIPTION - remove quotes
      //d.REQUESTED_DATETIME = parseTime(d.REQUESTED_DATETIME); //REQUESTED_DATETIME - convert to D3 datetime
      //d.UPDATED_DATETIME = parseTime(d.UPDATED_DATETIME); //UPDATED_DATETIME - convert to D3 datetime
      //d.EXPECTED_DATETIME = parseTime(d.EXPECTED_DATETIME); //EXPECTED_DATETIME - convert to D3 datetime
      d.ADDRESS = (d.ADDRESS).replace(/(^"|"$)/g, "").trim(); //ADDRESS - remove quotes
      d.LATITUDE = +d.LATITUDE; //LATITUDE - convert to number
      d.LONGITUDE = +d.LONGITUDE; //LONGITUDE - convert to number

    });


    ///////lets plot

    //Plot map
    leafletMap = new LeafletMap({ parentElement: '#mapDiv'}, data, null);



    //console.log(data)
})
.catch(error => {
    // console.error('Error loading the data');
    console.log(error);
});



function updateMapMarkerColor(val){
  if (val == "color_callType"){
    //leafletMap.colorVar = "SERVICE_CODE";
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