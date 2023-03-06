console.log("Hello world");
// const dispatcher = d3.dispatch('filterCategories');
let data;
let planetFilter = [];

// const parseTime = d3.timeParse("%Y-%m-%d");

d3.csv('.\\data\\Cincy311_2022_final.tsv')
  .then(_data => {
  	console.log('Data loading complete. Work with dataset.');
    
    //process the data - this is a forEach function.  You could also do a regular for loop.... 
    data.forEach(d => { //ARROW function - for each object in the array, pass it as a parameter to this function

    });


    //lets plot


    console.log(data)
})
.catch(error => {
    // console.error('Error loading the data');
    console.log(error);
});