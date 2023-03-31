class WordCloud{
  /**
   * Class constructor with basic configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data, ) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 800,
      containerHeight: _config.containerHeight || 400,
      margin: _config.margin || {top: 30, right: 30, bottom: 30, left: 30},
      tooltipPadding: _config.tooltipPadding || 15
    }

    // this.data = _data;
    this.data = [{word: "Running", size: "10"}, {word: "Surfing", size: "20"}, {word: "Climbing", size: "50"}, {word: "Kiting", size: "30"}, {word: "Sailing", size: "20"}, {word: "Snowboarding", size: "60"} ]

    //TODO: get word frequency out of the data
    this.initVis();

  }

  initVis(){
    let vis = this;
    vis.width = vis.config.containerWidth + vis.config.margin.left + vis.config.margin.right;
    vis.height = vis.config.containerHeight + vis.config.margin.top + vis.config.margin.bottom;

    // append the svg object to the body of the page
    vis.svg = d3.select(vis.config.parentElement)
      .append("svg")
        .attr("width", vis.width + vis.config.margin.left + vis.config.margin.right)
        .attr("height", vis.height + vis.config.margin.top + vis.config.margin.bottom)
        .append("g")
        .attr("transform",
              "translate(" + vis.config.margin.left + "," + vis.config.margin.top + ")");
  
    this.updateVis();
  }

  updateVis(){
    let vis = this;

    // Constructs a new cloud layout instance. It run an algorithm to find the position of words that suits your requirements
    // Wordcloud features that are different from one word to the other must be here
    vis.layout = d3.layout.cloud()
      .size([vis.width, vis.height])
      .words(vis.data.map(function(d) { return {text: d.word, size:d.size}; }))
      .padding(5)        //space between words
      .rotate(function() { return ~~(Math.random() * 2) * 90; })
      .fontSize(function(d) { return d.size; })      // font size of words
      .on("end", draw);
    vis.layout.start();

    // This function takes the output of 'layout' above and draw the words
    // Wordcloud features that are THE SAME from one word to the other can be here
    function draw(words) {
      vis.svg
        .append("g")
          .attr("transform", "translate(" + vis.layout.size()[0] / 2 + "," + vis.layout.size()[1] / 2 + ")")
          .selectAll("text")
            .data(words)
          .enter().append("text")
            .style("font-size", function(d) { return d.size; })
            .style("fill", "#69b3a2")
            .attr("text-anchor", "middle")
            .style("font-family", "Impact")
            .attr("transform", function(d) {
              return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .text(function(d) { return d.text; });
    }
    this.renderVis();
  }

  renderVis(){

  }
}
// List of words

