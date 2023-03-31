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
      containerHeight: _config.containerHeight || 400,
      margin: _config.margin || {top: 50, right: 30, bottom: 100, left: 80},
      tooltipPadding: _config.tooltipPadding || 15
    }
    
    // set the dimensions and margins of the graph
    this.data = _data;

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
    let myrollup = d3.rollup(vis.data.filter(d => !d.filtered), v => v.length, d => d.requested_date)
    vis.data = Array.from(myrollup, ([callDate, count]) => ({
      callDate: callDate,
      weeknum: +d3.timeFormat("%U")(d3.timeParse("%m/%d/%Y")(callDate)),
      weekday: d3.timeFormat("%a")(d3.timeParse("%m/%d/%Y")(callDate)),
      count: count
    }));
    this.data = this.fillNullDays(this.data);
    // append the svg object to the body of the page
    
    // Labels of row and columns
    vis.myGroups = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    vis.xScale.domain(Array.from({length: 54}, (x, i) => i))
    vis.yScale.domain(vis.myGroups.reverse())
   
    // Build color scale
    vis.myColor = d3.scaleLinear()
      .range(["#f1dbea", "violet"])
      .domain([0, d3.max(vis.data.filter(d => !d.filtered), d => d.count)])

    vis.renderVis()
  }

  renderVis(){
    let vis = this;
      vis.heatmap = vis.svg.selectAll('.heatmap')
        .data(vis.data.filter(d => !d.filtered))
      .join("rect")
        .attr("x", function(d) { return vis.xScale(d.weeknum) })
        .attr("y", function(d) { return vis.yScale(d.weekday) })
        .attr("width", vis.xScale.bandwidth() )
        .attr("height", vis.yScale.bandwidth() )
        .style("fill", function(d) { return vis.myColor(d.count)} )
      .on('mouseover', (event,d) => {
        d3.select('#tooltip')
          .style('display', 'block')
          .html(`<div class="tooltip-label">Calender Date: </div><div class="tooltip">${d.callDate}</div></br>
                <div class="tooltip-label">Calls Received: </div><div class="tooltip">${d.count}</div></br>`)
      })
      .on('mousemove', (event) => {
        d3.select('#tooltip')
          .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
          .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
      })
      .on('mouseleave', () => {
        d3.select('#tooltip').style('display', "none");
      });

      vis.svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "middle")
        .attr("x", vis.width/2)
        .attr("y", vis.height+60)
        .text("Start of the Week (2022)");

      vis.svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "middle")
        .attr("y", -60)
        .attr("x", -vis.height/2)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text("Week Day");

      vis.svg.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("y", -5)
        .attr("x", vis.width/2)
        // .attr("dy", ".75em")
        // .attr("transform", "rotate(-90)")
        .text("Density of Calls Per Day");
      //custom x-axis labels
      // let weekIndex = vis.xScale.domain().filter(d => d%5==0)
      // let days = vis.data.filter(d => weekIndex.includes(d.weeknum) && d.weekday == "Sun" || d.weeknum == 0)
      // days.sort((a,b) => a.weeknum - b.weeknum); 
      let months = ["Jan", "Feb", "Mar", "Apr", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      months.forEach((d, i)=>{
        vis.svg.append('text')
          .attr('class', 'label')
          .attr('y', 260)
          .attr('x', 64*i+3)
          .attr('dy', '.71em')
          .text(d);
      })

      //custom y-axis labels
      vis.myGroups.forEach((d, i)=>{
        vis.svg.append('text')
          .attr('class', 'label')
          .attr('y', 250 - 40*i)
          .attr('x', -5)
          .attr('dy', '.71em')
          .style('text-anchor', 'end')
          .text(d);
      })
    }

    fillNullDays(data){
      let lastDay = new Date(2022, 11, 31);

      for (var d = new Date(2022, 0, 1); d <= lastDay; d.setDate(d.getDate() + 1)) {
        let stringDate = ((d.getMonth() + 1) < 10 ? '0' : '')+ (d.getMonth() + 1) + "/" + ((d.getDate() < 10 ? '0' : '') + d.getDate())+ "/" +  d.getFullYear();
        //check missing date
        if (data.filter(d => d.callDate == stringDate).length == 0){
          let obj ={
            callDate: stringDate,
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