<template>
  <div class="vis-component" ref="chart">
    <svg id="main-svg" :width="svgWidth" :height="svgHeight">
      <g class="chart-group" ref="chartGroup">
        <g class="axis axis-x" ref="axisX">
          <g class="xLabel" ref="xLabel"></g>
        </g>
        <g class="axis axis-y" ref="axisY"></g>
        <g class="point-group" ref="scatterPointGroup"></g>
        <g class="rectangle-group" ref="rectangleGroup"></g>
      </g>
    </svg>
  </div>
</template>

<script>
import * as d3 from "d3";

export default {
  name: "Scatterplot",
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
    drawChart() {
      if (this.$refs.chart) this.svgWidth = this.$refs.chart.clientWidth;
      d3.select(this.$refs.chartGroup).attr(
        "transform",
        `translate(${this.svgPadding.left},${this.svgPadding.top})`
      );
      
      this.drawXAxis();
      this.drawYAxis();
      this.drawPoints();

    },
    //append rectangles in the right colors

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
        .text(data.location)
        .style("position", "absolute");
    },
    //on mouse leave delete tooltip
    deleteToolTip() {
      d3.select(".tooltip").remove();
    },
    //Draw x-Axis
    drawXAxis() {
      d3.select(this.$refs.axisX)
        .attr(
          "transform",
          `translate( 0, ${
            this.svgHeight - this.svgPadding.top - this.svgPadding.bottom
          } )`
        )
        .call(d3.axisBottom(this.xScale))
        .selectAll("text")
        .attr("y", 15)
        .attr("x", 10)
        .attr("dy", ".35em")
        
        .attr("transform", "rotate(30)")
        .style("text-anchor", "end");
      this.appendXAxisLabel();
    },
    appendXAxisLabel() {
      //For some reason it does not work if i call this.$refs.axisX no matter what I tried
      d3.select(this.$refs.axisY)
        .append("text")
        .attr("text-anchor", "end")
        .attr("fill", "black")
        .text("Diabetes prevalence")
        .attr("x", 200)
        .attr("y", 455)
        .style("font-size", 14);
    },
    //Draw y-axis
    drawYAxis() {
      d3.select(this.$refs.axisY).call(d3.axisLeft(this.yScale));

      this.appendYAxisLabel();
    },
    appendYAxisLabel() {
      //For some reason it does not work if i call this.$refs.axisX no matter what I tried
      d3.select(this.$refs.axisY)
        .append("text")
        .attr("text-anchor", "end")
        .attr("fill", "black")
        .text("ICU patients per million")
        .attr("x", -100)
        .attr("y", -50)
        .attr("transform", "rotate(-90)")
        .style("font-size", 14);
    },
    //Draw points
    drawPoints() {

      const scatterPointGroup = d3.select(this.$refs.scatterPointGroup);
      scatterPointGroup
        .selectAll(".point")
        .data(this.scatterData)
        .join("circle")
        .attr("class", "point")
        .attr("cx", (d) => this.xScale(d.diabetes_prevalence))
        .attr("cy", (d) => this.yScale(d.icu_patients))
        .attr("r", () => {return 4})
        .style("stroke", "brown")
        .on("mouseover", this.showToolTip)
        .on("mouseout", this.deleteToolTip);
    },

    combinedData() {
      let returnArray = [];
      for (let i = 0; i < this.$store.getters.personalIncome.length; ++i) {
        returnArray.push({
          state: this.$store.getters.educationRates[i].state,
          x: this.$store.getters.educationRates[i].value,
          y: this.$store.getters.personalIncome[i].value,
        });
      }
      return returnArray;
    },

  },
  computed: {
    scatterData: {
      get() {
        return this.$store.getters.getScatterData;
      },
    },

    dataMaxY() {
      return d3.max(this.scatterData, (d) => d.icu_patients);
    },
    dataMinY() {
      return d3.min(this.scatterData, (d) => d.icu_patients);
    },
    dataMaxX() {
      return d3.max(this.scatterData, (d) => d.diabetes_prevalence);
    },
    dataMinX() {
      return d3.min(this.scatterData, (d) => d.diabetes_prevalence);
    },
    xScale() {
      return d3
        .scaleLinear()
        .range([0, this.svgWidth - this.svgPadding.right])
        .domain([this.dataMinX, this.dataMaxX]);
    },

    yScale() {
      return d3
        .scaleLinear()
        .range([
          this.svgHeight - this.svgPadding.top - this.svgPadding.bottom,
          0,
        ])
        .domain([this.dataMinY, this.dataMaxY]);
    },
  },
  watch: {
    scatterData: {
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
</style>
