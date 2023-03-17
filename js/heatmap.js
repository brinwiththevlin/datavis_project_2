class HeatMap {
    
    /**
   * Class constructor with basic configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data, _colorVar) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 800,
      containerHeight: _config.containerHeight || 450,
      margin: _config.margin || {top: 30, right: 30, bottom: 30, left: 30},
      tooltipPadding: _config.tooltipPadding || 15
    }
    
    // set the dimensions and margins of the graph
    let myrollup = d3.rollup(_data, v => v.length, d => d.requested_date)
    this.data = Array.from(myrollup, ([calDate, count]) => ({
      calDate: calDate,
      weeknum: +d3.timeFormat("%U")(d3.timeParse("%m/%d/%Y")(calDate)),
      weekday: d3.timeFormat("%a")(d3.timeParse("%m/%d/%Y")(calDate)),
      count: count
    }));

    this.data = this.fillNullDays(this.data);

    this.initVis();
  }

  initVis() {
    let vis = this;

    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
   
    vis.yScale = d3.scaleBand()
    .range([vis.height, 0])
    // .domain(myGroups)

    vis.xScale = d3.scaleBand()
        .range([0, vis.width])

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
    vis.myGroups = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    
    vis.xScale.domain(Array.from({length: 54}, (x, i) => i))
    vis.yScale.domain(vis.myGroups.reverse())
   
    // Build color scale
    vis.myColor = d3.scaleLinear()
      .range(["#f1dbea", "violet"])
      .domain([0,d3.max(vis.data, d => d.count)])

    vis.renderVis()
  }

  renderVis(){
    let vis = this;
      vis.heatmap = vis.svg.selectAll('.heatmap')
        .data(vis.data)
      .join("rect")
        .attr("x", function(d) { return vis.xScale(d.weeknum) })
        .attr("y", function(d) { return vis.yScale(d.weekday) })
        .attr("width", vis.xScale.bandwidth() )
        .attr("height", vis.yScale.bandwidth() )
        .style("fill", function(d) { return vis.myColor(d.count)} )
      .on('mouseover', (event,d) => {
        d3.select('#tooltip')
          .style('opacity', 1)
          .style('display', 'block')
          .html(`<div class="tooltip-label">Calender Date: </div><div class="tooltip">${d.calDate}</div></br>
                <div class="tooltip-label">Calls received: </div><div class="tooltip">${d.count}</div></br>`)
      })
      .on('mousemove', (event) => {
        d3.select('#tooltip')
          .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
          .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
      })
      .on('mouseleave', () => {
        d3.select('#tooltip').style('opacity', 0);
      });
    }

    fillNullDays(data){
      console.log("fillnulldays called")

      let lastDay = new Date(2022, 11, 31);

      for (var d = new Date(2022, 0, 1); d <= lastDay; d.setDate(d.getDate() + 1)) {
        let stringDate = ((d.getMonth() + 1) < 10 ? '0' : '')+ (d.getMonth() + 1) + "/" + ((d.getDate() < 10 ? '0' : '') + d.getDate())+ "/" +  d.getFullYear();
        //check missing date
        if (data.filter(d => d.calDate == stringDate).length == 0){
          let obj ={
            calDate: stringDate,
            weeknum: +d3.timeFormat("%U")(d3.timeParse("%m/%d/%Y")(stringDate)),
            weekday: d3.timeFormat("%a")(d3.timeParse("%m/%d/%Y")(stringDate)),
            count: 0
          }
          data.push(obj);
        }  
      }
      return data;
    }
}