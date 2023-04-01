class WordCloud{
  /**
   * Class constructor with basic configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data, _infoText) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 400,
      containerHeight: _config.containerHeight || 400,
      margin: _config.margin || {top: 30, right: 30, bottom: 30, left: 30},
      tooltipPadding: _config.tooltipPadding || 15,
      infoText: _infoText
    }
    this.data = _data;
    this.initVis();
  }

  initVis(){
    let vis = this;
    vis.width = vis.config.containerWidth + vis.config.margin.left + vis.config.margin.right;
    vis.height = vis.config.containerHeight + vis.config.margin.top + vis.config.margin.bottom;

    vis.sizeScale = d3.scaleLinear()
      .range([20, 52])     
    // append the svg object to the body of the page
    vis.svg = d3.select(vis.config.parentElement)
      .append("svg")
        .attr("width", vis.width + vis.config.margin.left + vis.config.margin.right)
        .attr("height", vis.height + vis.config.margin.top + vis.config.margin.bottom)
        .append("g")
        .attr("transform",
              "translate(" + (15) + "," + (40) + ")");

    // Info Logo
    vis.svg
    .append("svg:image")
    .attr("xlink:href", "../styles/info-logo.png")
    .attr('class', 'info-logo')
    .attr("transform", "translate(" + (240) + " ," + (-215) + ")")
    .on('click', (event, d) => {
        if (!d3.select('#info-tooltip').classed("selected") ){
            d3.select('#info-tooltip').classed("selected", true)
            .style('display', 'block')
            .style('left', (event.pageX + 5) + 'px')   
            .style('top', (event.pageY) + 'px')
            .html(`
                <div class="tooltip-description">${vis.config.infoText}</div>
                
            `);
            }else{
            d3.select('#info-tooltip').classed("selected", false);
            d3.select('#info-tooltip').style('display', 'none');
            }
        
    })
    .on("mouseover", function(d){ 
      d3.select(this).attr("xlink:href", "../styles/info-logo-blue.png");
    })
    .on("mouseleave", function(d){ 
        d3.select(this).attr("xlink:href", "../styles/info-logo.png");
    })
  
    vis.updateVis();
  }

  updateVis(){
    let vis = this;

    vis.freqMap = {}
    vis.data.forEach(d => {
      if (!d.filtered && !d.description.includes("Request entered through the Web. Refer to Intake Questions for further description.")) {
        let words = d.description.replace(/[^a-z\s]/igm,"").toLowerCase().split(/\s/gm).filter(string => string);
        words.forEach(w => {
          if (!vis.freqMap[w] && !stop_words.includes(w.replace(/\s/ig, ""))) {
            vis.freqMap[w] = 1;
          }
          else if (!stop_words.includes(w)){
            vis.freqMap[w] += 1;
          }
        })
      }
    })
    vis.data = Object.entries(vis.freqMap).map((e) => ( { word:e[0], size:e[1] } ))
    vis.data.sort((a,b) => b.size - a.size)
    vis.data = vis.data.slice(0, 50)

    vis.sizeValue = d => d.size;
    vis.sizeScale.domain(d3.extent(vis.data, vis.sizeValue))

    // Constructs a new cloud layout instance. It run an algorithm to find the position of words that suits your requirements
    // Wordcloud features that are different from one word to the other must be here
    vis.layout = d3.layout.cloud()
      .size([vis.width, vis.height])
      .words(vis.data.map(function(d) { return {text: d.word, size:vis.sizeScale(vis.sizeValue(d))}; }))
      .padding(8)        //space between words
      .rotate(function() { return ~~(Math.random() * 2) * 90; })
      .fontSize(function(d) { return d.size; })      // font size of words
      .on("end", draw);
    vis.layout.start();

    // This function takes the output of 'layout' above and draw the words
    // Wordcloud features that are THE SAME from one word to the other can be here
    function draw(words) {
      vis.svg
        .join("g")
          .attr("transform", "translate(" + vis.layout.size()[0] / 2 + "," + vis.layout.size()[1] / 2 + ")")
          .selectAll("text")
            .data(words)
          .join("text")
            .style("font-size", function(d) { return d.size; })
            .style("font-family", "Varela")
            .style("fill", "#77aac6")
            .attr("text-anchor", "middle")
            .attr("transform", function(d) {
              return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .text(function(d) { return d.text; });
    }
  }
}