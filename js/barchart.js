class Barchart {
    /**
     * @param {Object}
     * @param {Array}
     */
    constructor(_config, _data, _aggregateAttr, _title, _xLabel, _yLabel, _XAxisLabelHeight = 20) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 300,
            containerHeight: _config.containerHeight || 300,
            margin: _config.margin || {top: 35, right: 10, bottom: 20, left: 70},
            title: _title,
            xLabel: _xLabel,
            yLabel: _yLabel,
            XAxisLabelHeight: _XAxisLabelHeight
        }
        this.data = _data;
        this.aggregateAttr = _aggregateAttr;
        this.initVis();
    }

    initVis() {
        let vis = this;
        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right - 20;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom - vis.config.XAxisLabelHeight;

        // Initialize scales and axes
        // Important: we flip array elements in the y output range to position the rectangles correctly
        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0]) 

        vis.xScale = d3.scaleBand()
            .range([0, vis.width])
            .paddingInner(0.2);

        vis.xAxis = d3.axisBottom(vis.xScale)
            .tickSizeOuter(0);

        vis.yAxis = d3.axisLeft(vis.yScale)
            .ticks(6)
            .tickSizeOuter(0);
        
        // Define size of SVG drawing area
        vis.svg = d3.select(vis.config.parentElement)
            .attr('class', 'barchart')
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

    // Used to sort by a property value. Currently sorts in descending order by frequency.
    compare(a, b) {
        if (a.count < b.count){
            return 1;
        }
        if (a.count > b.count){
            return -1;
        }
        return 0;
    }

    updateVis(){
        let vis = this;
        const aggregatedDataMap = d3.rollups(vis.data, v => d3.sum(v, d => !d.filtered), d => d[this.aggregateAttr]);
        vis.aggregatedData = Array.from(aggregatedDataMap, ([key, count]) => ({ key, count }));

        vis.aggregatedData.sort(this.compare);

        vis.xValue = d => d.key;
        vis.yValue = d => d.count;

        // Set the scale input domains
        vis.xScale.domain(vis.aggregatedData.map(vis.xValue));
        vis.yScale.domain([0, d3.max(vis.aggregatedData, vis.yValue) + 1]);

        vis.renderVis();
    }

    renderVis() {
        let vis = this;

        // Add rectangles
        const bars = vis.chart.selectAll('.bar')
            .data(vis.aggregatedData, vis.xValue)
            .join('rect')
            .attr('class', 'bar')
            .attr('x', d => vis.xScale(vis.xValue(d)))
            .attr('width', vis.xScale.bandwidth() * .9)
            .attr('transform', `translate(${vis.xScale.bandwidth() * .05}, 0)`)
            .attr('y', vis.yScale(0))
            .attr('height', 0)
            .attr('class', function(d) {
                if(globalDataFilter.find(f => (f[0] === vis.aggregateAttr && f[1].includes(d.key)))){
                    return 'bar active' // adding active class to newly rendered bars that were already a filter
                }else{
                    return 'bar'
                }
            });

            bars.transition().duration(1000)
            .attr('height', d => vis.height - vis.yScale(vis.yValue(d)))
            .attr('y', d => vis.yScale(vis.yValue(d)));

            bars.on('click', function(event, d) {
                vis.toggleFilter(d.key);
            });

        bars.on('mouseover', (event, d) => {
            d3.select('#tooltip')
            .style('display', 'block')
            .style('left', (event.pageX - 65) + 'px')   
            .style('top', (event.pageY - 45) + 'px')
            .html(`
                <div class="tooltip-title">${vis.config.xLabel}: ${d.key}</div>
                <div class="tooltip-title">${vis.config.yLabel}: ${d.count}</div>
            `);
        })
        .on('mouseleave', () => {
            d3.select('#tooltip').style('display', 'none');
        });

        vis.xAxisG.call(vis.xAxis)
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-55)")
            .style("text-anchor", "end");
        vis.yAxisG.call(vis.yAxis);

        vis.chart.select('.x-axis')
            .selectAll('.tick text')
            .attr('class', function(d) {
                if(globalDataFilter.find(f => (f[0] === vis.aggregateAttr && f[1].includes(d)))){
                    return 'active' // adding active class to newly rendered x-axis labels that were already a filter
                }else{
                    return ''
                }
            })
            .on('click', function(event, d) {
                let xLabel = event.srcElement.__data__
                vis.toggleFilter(xLabel)
            });
    }

    toggleFilter(filterProperty){
        let attrFilter = globalDataFilter.find(f => (f[0] === this.aggregateAttr))
        const attrIndex = globalDataFilter.indexOf(attrFilter);
        if (attrIndex === -1){ // Attribute has never been filtered on
            globalDataFilter.push([this.aggregateAttr, [filterProperty]]); // Append new filter
        }else{ // Attribute is either being removed entirely or needs to be OR'd
            let specificFilter = globalDataFilter[attrIndex]
            let specificFilterProperty = specificFilter[1].find(s => (s === filterProperty))
            const specificFilterIndex = specificFilter[1].indexOf(specificFilterProperty);
            // Specific filter property was found, so we remove it
            if (specificFilterIndex > -1) {
                if (specificFilter[1].length === 1){
                    globalDataFilter.splice(attrIndex, 1); // remove entire attribute filter since no specific attributes are selected for it
                }else{
                    specificFilter[1].splice(specificFilterIndex, 1); // only removes specific filter from that attribute
                }
            }else{ // Attribute already has at least 1 filter on it, so we add the new filter to that attribute's array
                specificFilter[1].push(filterProperty); // Append new filter
            }
        }
        filterData(); // Call global function to update visuals
    }
}