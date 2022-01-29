<template>
  <div class="vis-component" ref="chart">

    <svg id="main-svg-line" :width="svgWidth" :height="svgHeight">
      <g class="chart-group-line" ref="chartGroup">
        <g class="axis-x-line" ref="axisX">
          <g class="xLabelLine" ref="xLabel"></g>
        </g>
        <g class="axis-y-line" ref="axisY"></g>
        <g class="line-group" ref="lineGroup"></g>
      </g>
    </svg>
        <div id="changeView">
      <button v-on:click="firstView" class="btn btn-primary">Vacc VS Infections</button>
      <button v-on:click="gdpView" class="btn btn-primary">GDP and Vacc Rate</button>
    </div>
  </div>
</template>

<script>
import * as d3 from "d3";
// import * as d3Collection from "d3-collection";
export default {
  name: "LinePlot",
  props: {},
  data() {
    return {
      svgWidth: 500,
      svgHeight: 500,
      svgPadding: {
        top: 40,
        right: 70,
        bottom: 40,
        left: 60,
      },
    };
  },
  mounted() {
    this.drawChart();
  },
  methods: {
    firstView() {
      // this.reappendSVGs()
      this.drawChart();
    },

    drawChart() {
      if (this.$refs.chart) this.svgWidth = this.$refs.chart.clientWidth;
      d3.select(this.$refs.chartGroup).attr(
        "transform",
        `translate(${this.svgPadding.left},${this.svgPadding.top})`
      );

      this.drawXAxis();
      this.drawYAxis();

      this.drawLines();
      this.drawLines2();
    },
    //Tooltip
    showToolTip(event, data) {
      //Delete old Tooltip before displaying new one
      d3.select(".tooltip").remove();
      d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("left", `${event.pageX - 30}px`)
        .style("top", `${event.pageY - 30}px`)
        .style("opacity", 1)
        .style("font-size", "17px")
        .style("font-weight", "bold")
        .text(data.State + " new Cases/Million")
        .style("position", "absolute");
    },
    showToolTip2(event, data) {
      //Delete old Tooltip before displaying new one
      d3.select(".tooltip").remove();
      d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("left", `${event.pageX - 30}px`)
        .style("top", `${event.pageY - 30}px`)
        .style("opacity", 1)
        .style("font-size", "17px")
        .style("font-weight", "bold")
        .text(data.State + " new Vacc/Million")
        .style("position", "absolute");
    },
    //on mouse leave delete tooltip
    deleteToolTip() {
      d3.select(".tooltip").remove();
    },
    //Draw x-Axis
    drawXAxis() {
      d3.select(".axis-x-line")
        .attr(
          "transform",
          `translate( 0, ${
            this.svgHeight - this.svgPadding.top - this.svgPadding.bottom
          } )`
        )
        .call(d3.axisBottom(this.xScale))
        .selectAll("text")
        .attr("y", 20)
        .attr("x", 3)
        .attr("dy", ".35em")
        .style("text-anchor", "end");
      this.appendXAxisLabel();
    },
    appendXAxisLabel() {
      //For some reason it does not work if i call this.$refs.axisX no matter what I tried
      d3.select(".axis-y-line")
        .append("text")
        .attr("text-anchor", "end")
        .attr("fill", "black")
        .text("Timeline")
        .attr("x", 250)
        .attr("y", 455)
        .style("font-size", 14);
    },
    //Draw y-axis
    drawYAxis() {
      d3.select(".axis-y-line").call(d3.axisLeft(this.yScale));

      this.appendYAxisLabel();
    },
    appendYAxisLabel() {
      d3.select(".line-y-text").remove();
      //For some reason it does not work if i call this.$refs.axisX no matter what I tried
      d3.select(".axis-y-line")
        .append("text")
        .attr("text-anchor", "end")
        .attr("fill", "black")
        .text("New cases/million (smoothed) vs new Vacc/Million")
        .attr("class","line-y-text")
        .attr("x", -60)
        .attr("y", -50)
        .attr("transform", "rotate(-90)")
        .style("font-size", 14);
    },
    //Draw points
    drawLines() {
      d3.selectAll(".line").remove();
      const lineGroup = d3.select(".line-group");
      lineGroup
        .selectAll(".line-group")
        .data(this.getLineData)
        .enter()
        .append("g")
        // .attr("class", "line-group")
        .append("path")
        .attr("class", "line")
        .style("stroke", (d, i) => this.getColors(i))
        .attr("d", (d) => {
          return this.lineGenerator(d.values);
        })
        .on("mouseover", this.showToolTip)
        .on("mouseout", this.deleteToolTip);
    },
    drawLines2() {
      const lineGroup = d3.select(".line-group");
      lineGroup
        .selectAll(".line-group")
        .data(this.getLineData)
        .enter()
        .append("g")
        // .attr("class", "line-group")
        .append("path")
        .attr("class", "line")
        .style("stroke", (d, i) => this.getColors(i))
        .attr("d", (d) => {
          return this.lineGenerator2(d.values);
        })
        .on("mouseover", this.showToolTip2)
        .on("mouseout", this.deleteToolTip);
    },

    //GDP View

    gdpView() {
      this.drawGDPChart();
    },

    reappendSVGs() {
            d3.select(this.$refs.chartGroup).remove();
      d3.select("#main-svg-line")
        .append("g")
        .attr("class", "chart-group-line")
        .attr("ref", "chartGroup")
        .append("g")
        .attr("class", "axis-x-line")
        .attr("ref", "axisX")
        .append("g")
        .attr("class", "xLabelLine")
        .attr("ref", "xLabel");

      d3.select(".chart-group-line")
        .append("g")
        .attr("class", "axis-y-line")
        .attr("ref", "axisY");

      d3.select(".chart-group-line")
        .append("g")
        .attr("class", "line-group")
        .attr("ref", "lineGroup");
    },

    drawGDPChart() {
      this.reappendSVGs();

      if (this.$refs.chart) this.svgWidth = this.$refs.chart.clientWidth;
      d3.select(".chart-group-line").attr(
        "transform",
        `translate(${this.svgPadding.left},${this.svgPadding.top})`
      );

      this.drawXAxis();
      this.drawYAxisGDP();

      this.drawLinesGDP();
    },
    //Draw x-Axis

    //Draw y-axis
    drawYAxisGDP() {
      d3.select(".axis-y-line").call(d3.axisLeft(this.yScaleGDP));

      this.appendYAxisLabelGDP();
    },
    appendYAxisLabelGDP() {
      d3.select(".line-y-text").remove();
      //For some reason it does not work if i call this.$refs.axisX no matter what I tried
      d3.select(".axis-y-line")
        .append("text")
        .attr("text-anchor", "end")
        .attr("fill", "black")
        .text("Percentage Vaccinated (%)")
        .attr("class","line-y-text")
        .attr("x", -60)
        .attr("y", -50)
        .attr("transform", "rotate(-90)")
        .style("font-size", 14);
    },

    drawLinesGDP() {
      d3.selectAll(".line").remove();
      const lineGroup = d3.select(".line-group");
      lineGroup
        .selectAll(".line-group")
        .data(this.getLineData)
        .enter()
        .append("g")
        .append("path")
        .attr("class", "line")
        .style("stroke", (d, i) => this.getColors(i))
        .attr("d", (d) => {
          return this.lineGeneratorGDP(d.values);
        })
        .on("mouseover", this.showToolTipGDP)
        .on("mouseout", this.deleteToolTip);
    },
    showToolTipGDP(event, data) {
      //Delete old Tooltip before displaying new one
      d3.select(".tooltip").remove();
      d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("left", `${event.pageX - 30}px`)
        .style("top", `${event.pageY - 30}px`)
        .style("opacity", 1)
        .style("font-size", "17px")
        .style("font-weight", "bold")
        .text(data.State + " GDP per head: " +  (data.GDP/data.population).toFixed(6) )
        .style("position", "absolute");
    },
  },
  computed: {
    getColors() {
      return d3.scaleOrdinal(d3.schemeDark2);
    },
    lineGeneratorGDP() {
      return d3
        .line()
        .x((d) => this.xScale(d.year))
        .y((d) => this.yScaleGDP(d.vacc_percentage));
    },
    lineGenerator() {
      return d3
        .line()
        .x((d) => this.xScale(d.year))
        .y((d) => this.yScale(d.cases));
    },
    lineGenerator2() {
      return d3
        .line()
        .x((d) => this.xScale(d.year))
        .y((d) => this.yScale(d.vacc));
    },
    getLineData: {
      get() {
        return this.$store.getters.getLineData;
      },
    },

    dataMaxY() {
      console.log(this.getLineData);
      return d3.max(this.getLineData, (d) => d.max);
    },
    dataMinY() {
      return d3.min(this.covid, (d) => d.icu_patients_per_million);
    },
    dataMaxX() {
      return d3.max(this.getLineData, (d) => d.maxDate);
    },
    dataMinX() {
      return d3.min(this.getLineData, (d) => d.minDate);
    },
    xScale() {
      return d3
        .scaleTime()
        .domain([this.dataMinX, this.dataMaxX])
        .range([0, this.svgWidth - this.svgPadding.right]);
    },

    yScale() {
      return d3
        .scaleLinear()
        .range([
          this.svgHeight - this.svgPadding.top - this.svgPadding.bottom,
          0,
        ])
        .domain([0, this.dataMaxY]);
    },

    //GDP View
    dataMaxYGDP() {
      console.log(this.getLineData);
      return d3.max(this.getLineData, (d) => d.GDP);
    },
    yScaleGDP() {
      return d3
        .scaleLinear()
        .range([
          this.svgHeight - this.svgPadding.top - this.svgPadding.bottom,
          0,
        ])
        .domain([0, 100]);
    },
  },
  watch: {
    getLineData: {
      handler() {
        this.drawChart();
      },
      deep: true,
    },
  },
};
</script>

<style>
.point {
  border-radius: 10px;
  fill: black;
}
.point:hover {
  fill: lightblue;
}
.line {
  fill: none;
  stroke: #000;
  stroke-width: "0.5px";
}
</style>
