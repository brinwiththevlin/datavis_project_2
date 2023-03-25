class Histogram {
    /**
     * @param {Object}
     * @param {Array}
     */
    constructor(_config, _data, _aggregateAttr, _title, _xLabel, _yLabel, _XAxisLabelHeight = 20) {
		this.config = {
			parentElement: _config.parentElement,
			containerWidth: _config.containerWidth || 500,
			containerHeight: _config.containerHeight || 400,
			margin: _config.margin || {top: 35, right: 10, bottom: 30, left: 70},
			title: _title,
			xLabel: _xLabel,
			yLabel: _yLabel,
			XAxisLabelHeight: _XAxisLabelHeight
			}
		this.aggregateAttr = _aggregateAttr;
        this.data = _data;
        this.initVis();
    }

    initVis() {
		let vis = this;
        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right - 20;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom - vis.config.XAxisLabelHeight;

        // Initialize scales and axes
        // Important: we flip array elements in the y output range to position the rectangles correctly
		vis.xScale = d3.scaleLinear().domain([0, d3.max(vis.data, d => d[vis.aggregateAttr])])
			.range([0, vis.width]);
				
		vis.yScale = d3.scaleLog()
			.range([ vis.height, 0]);

        vis.xAxis = d3.axisBottom(vis.xScale)
            .tickSizeOuter(0);

        vis.yAxis = d3.axisLeft(vis.yScale)
            .ticks(6)
            .tickSizeOuter(0);
        
        // Define size of SVG drawing area
        vis.svg = d3.select(vis.config.parentElement)
            .attr('class', 'histogram')
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);

        // SVG Group containing the actual chart; D3 margin convention
        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        // Append empty x-axis group and move it to the bottom of the chart
        vis.xAxisG = vis.chart.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${vis.height})`);
        
        // Append y-axis group 
        vis.yAxisG = vis.chart.append('g')
            .attr('class', 'axis y-axis')
            .attr('transform', `translate(0,0)`);

        // Title
        vis.svg.append("text")
            .attr("x", vis.config.containerWidth / 2)
            .attr("y", 25)
            .attr("text-anchor", "middle")
            .style("font-size", "24px")
            .text(vis.config.title);

        // Y-Axis Label
        vis.svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", - (vis.config.containerHeight / 2))
            .attr("y", 20)
            .style("text-anchor", "middle")
            .text(vis.config.yLabel);

        // X-Axis Label
        vis.svg.append("text")
            .attr("transform", "translate(" + (vis.config.containerWidth / 2) + " ," + (vis.config.containerHeight - 5) + ")")
            .style("text-anchor", "middle")
            .text(vis.config.xLabel);
    }

    updateVis(nBin){
        let vis = this;
        vis.data = vis.data.filter(d => d.filtered === false);

		vis.xValue = d => d[vis.aggregateAttr];
        vis.yValue = d => d.count;

        vis.renderVis(nBin);
    }

    renderVis(nBin) {
		let vis = this;
		
        let histogram = d3.histogram()
		.value(d => d[vis.aggregateAttr])
		.domain(vis.xScale.domain())
		.thresholds(vis.xScale.ticks(nBin)); // # of bins
		
		let bins = histogram(vis.data);
		
		vis.yScale.domain([1e-1, d3.max(bins, d => d.length)]);

		let u = vis.chart.selectAll("rect")
			.data(bins)

		// Manage the existing bars and newly added ones
		u.join("rect")
			.attr('class', 'bar')
			.merge(u) // merge existing elements
			.transition() // apply changes to all of them
			.duration(1000)
			.attr("x", 1)
			.attr("transform", function(d) {
				return "translate(" + vis.xScale(d.x0) + "," + vis.yScale(d.length) + ")";
			})
			.attr("width", function(d) { return vis.xScale(d.x1) - vis.xScale(d.x0); })
			.attr("height", function(d) { return vis.height - vis.yScale(d.length) })
			.style("fill", "#69b3a2")

		// If less bars exist in the new histogram, delete bars no longer in use
		u.exit().remove()

		vis.xAxisG.call(vis.xAxis)
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-55)")
            .style("text-anchor", "end");
        vis.yAxisG.call(vis.yAxis);
	
		this.chart.selectAll("rect").on('mouseover', (event, d) => {
			d3.select('#tooltip')
			.style('display', 'block')
			.style('left', (event.pageX + 15) + 'px')   
			.style('top', (event.pageY + 15) + 'px')
			.html(`
				<div class="tooltip-title">${vis.config.xLabel}: ${d.x0}-${d.x1}</div>
                <div class="tooltip-title">${vis.config.yLabel}: ${d.length}</div>
			`);
		})
		.on('mouseleave', () => {
			d3.select('#tooltip').style('display', 'none');
		});
    }
}