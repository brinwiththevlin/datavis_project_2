class HeatMap {
    
    /**
   * Class constructor with basic configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data, _colorVar) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 450,
      containerHeight: _config.containerHeight || 450,
      margin: _config.margin || {top: 30, right: 30, bottom: 30, left: 30},
      tooltipPadding: _config.tooltipPadding || 15
    }
    
    // set the dimensions and margins of the graph
    let myrollup = d3.rollup(_data, v => v.length, d => d.requested_date)
    this.data = Array.from(myrollup, ([calDate, count]) => ({
      calDate: calDate,
      weeknum: d3.timeFormat("%U")(d3.timeParse("%m/%d/%Y")(calDate)),
      weekday: d3.timeFormat("%a")(d3.timeParse("%m/%d/%Y")(calDate)),
      count: count
    }));
    


    this.initVis();
  }

  initVis() {
    let vis = this;

    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
  //    // Build X scales and axis:
  //    var x = d3.scaleBand()
  //    .range([ 0, width ])
  //    .domain(myGroups)
  //    .padding(0.01);
  //  svg.append("g")
  //    .attr("transform", "translate(0," + height + ")")
  //    .call(d3.axisBottom(x))
   
  //  // Build X scales and axis:
  //  var y = d3.scaleBand()
  //    .range([ height, 0 ])
  //    .domain(myVars)
  //    .padding(0.01);
  //  svg.append("g")
  //    .call(d3.axisLeft(y));
   
    vis.yScale = d3.scaleBand()
    .range([vis.height, 0])
    // .domain(myGroups)

    vis.xScale = d3.scaleBand()
        .range([0, vis.width])
        // .domain([0, d3.max(vis.data, d => d.sy_dist)]).nice()
        // .domain([0, 2000]).nice()

    vis.xAxis = d3.axisBottom(vis.xScale)
        .tickSizeOuter(0);

    vis.yAxis = d3.axisLeft(vis.yScale)
        .tickSizeOuter(0)

    vis.svg = d3.select(vis.config.parentElement)
    .append("svg")
      .attr("width", vis.width + vis.config.margin.left + vis.config.margin.right)
      .attr("height", vis.height + vis.config.margin.top + vis.config.margin.bottom)
    .append("g")
      .attr("transform",
            `translate(${vis.config.margin.left},${vis.config.margin.top})`);
    
    vis.chart = vis.svg.append('g')
      .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);
    
      vis.xAxisG = vis.chart.append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', `translate(0,${vis.height})`);

    // Append y-axis group 
    vis.yAxisG = vis.chart.append('g')
        .attr('class', 'axis y-axis');

    vis.updateVis();
  }

  updateVis(){
    
    let vis = this;
    // append the svg object to the body of the page
    
    // Labels of row and columns
    vis.myGroups = [ "Mon", "Sun", "Sat", "Fri", "Thu", "Wed", "Tue" ];
    
    
    vis.xScale.domain([0,53])

    vis.yScale.domain(vis.myGroups)
    
   
    // Build color scale
    vis.myColor = d3.scaleLinear()
      .range(["white", "#69b3a2"])
      .domain([0,d3.max(vis.data, d => d.count)])

    vis.renderVis()
  }


  renderVis(){
    let vis = this;
      vis.map = vis.svg.selectAll()
      .data(vis.data)
      .enter()
      .append("rect")
        .attr("x", function(d) { return vis.xScale(d.weeknum) })
        .attr("y", function(d) { return vis.yScale(d.weekday) })
        .attr("width", vis.xScale.bandwidth() )
        .attr("height", vis.yScale.bandwidth() )
        .style("fill", function(d) { return vis.myColor(d.count)} )
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave)

      // Three function that change the tooltip when user hover / move / leave a cell
      var mouseover = function(d) {
        d3.select("#tooltip").style("opacity", 1)
        
      }
      var mousemove = function(d) {
        d3.select("#tooltip")
          .html(`<div class="tooltip-label">Calender Date: </div><div class="tooltip">${d.calDate}</div></br>
                 <div class="tooltip-label">Calls received: </div><div class="tooltip">${d.count}</div></br>`)
          .style("left", (d3.mouse(vis)[0]+70) + "px")
          .style("top", (d3.mouse(vis)[1]) + "px")
      }
      var mouseleave = function(d) {
        d3.select("#tooltip").style("opacity", 0)
      }
    
      // add the squares
      
    }
}