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
    margin: _config.margin || {top: 30, right: 30, bottom: 100, left: 80},
    tooltipPadding: _config.tooltipPadding || 15
    }

    // this.data = _data;
    this.data = [{word: "Running", size: "10"}, {word: "Surfing", size: "20"}, {word: "Climbing", size: "50"}, {word: "Kiting", size: "30"}, {word: "Sailing", size: "20"}, {word: "Snowboarding", size: "60"} ]

    //TODO: get word frequency out of the data
    this.initVis();

  }

  initVis(){
    this.width = this.config.containerWidth + this.config.margin.left + this.config.margin.right;
    this.height = this.config.containerHeight + this.config.margin.top + this.config.margin.bottom;
    this.svg = d3.select(this.config.parentElement)//.append("svg")
      .attr("width", this.width)
      .attr("height", this.height)
      .append("g")
        .attr("transform",
            "translate(" + this.config.margin.left + "," + this.config.margin.top + ")");

    this.updateVis();
  }

  updateVis(){
    this.layout = d3.layout.cloud()
      .size([this.width, this.height])
      .words(this.data.map(function(d) { return {text: d.word, size:d.size}; }))
      .padding(5)        //space between words
      .rotate(function() { return ~~(Math.random() * 2) * 90; })
      .fontSize(function(d) { return d.size; })      // font size of words
      .on("end",function (words) {
        this.svg
          .append("g")
            .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
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
      });
    this.layout.start();
  }

  renderVis(){

  }
  
}

// List of words

