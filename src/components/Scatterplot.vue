<template>
  <div class="vis-component" ref="chart">
    <svg id="main-svg" :width="svgWidth" :height="svgHeight">
      <g class="chart-group" ref="chartGroup">
        <g class="axis axis-x" ref="axisX"><g class="xLabel" ref="xLabel"></g></g>
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
      this.paintPlotColors();
      this.drawPoints();
      this.calculatePointPosition(this.combinedData());
    },
    //append rectangles in the right colors
    paintPlotColors() {
      for (var xDistance = 0; xDistance < 3; xDistance++) {
        for (var yDistance = 0; yDistance < 3; yDistance++) {
          d3.select(this.$refs.rectangleGroup)
            .append("g")
            .attr("class", "rectangles")
            .append("rect")
            .style("width", (this.svgWidth - this.svgPadding.right) / 3)
            .style(
              "height",
              (this.svgHeight - this.svgPadding.top - this.svgPadding.top) / 3
            )
            .style(
              "x",
              (xDistance * (this.svgWidth - this.svgPadding.right)) / 3
            )
            .style(
              "y",
              (yDistance *
                (this.svgHeight - this.svgPadding.top - this.svgPadding.top)) /
                3
            )
            .style("fill", this.getColor(xDistance, yDistance))
            .style("stroke", "black");
        }
      }
      //Push rectangles behind points
      d3.select(this.$refs.rectangleGroup).lower();
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
        .style("font-size","17px")
        .style("font-weight","bold")
        .text(data.state)
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
        .call(d3.axisBottom(this.xScale) )
        .selectAll("text")
        .attr("y", 20)
        .attr("x", 3)
        .attr("dy", ".35em")
        .style("text-anchor", "end");
          this.appendXAxisLabel();
    },
    appendXAxisLabel(){
      //For some reason it does not work if i call this.$refs.axisX no matter what I tried
      d3.select(this.$refs.axisY).append("text")       
        .attr("text-anchor", "end")
        .attr("fill", "black")
        .text("Educational Attainment: Bachelor's Degree or Higher (%)")
        .attr("x",390)
        .attr("y",455)
        .style("font-size",14);
    },
    //Draw y-axis
    drawYAxis() {
      d3.select(this.$refs.axisY)
        .call(d3.axisLeft(this.yScale));
    
    this.appendYAxisLabel();
    },
        appendYAxisLabel(){
      //For some reason it does not work if i call this.$refs.axisX no matter what I tried
      d3.select(this.$refs.axisY).append("text")       
        .attr("text-anchor", "end")
        .attr("fill", "black")
        .text("Average Yearly Personal Income (in $)")
        .attr("x",-100)
        .attr("y",-50)
                .attr('transform', 'rotate(-90)')
        .style("font-size",14);
    },
    //Draw points
    drawPoints() {
      const scatterPointGroup = d3.select(this.$refs.scatterPointGroup);
      scatterPointGroup
        .selectAll(".point")
        .data(this.combinedData)
        .join("circle")
        .attr("class", "point")
        .attr("cx", (d) => this.xScale(d.x))
        .attr("cy", (d) => this.yScale(d.y))
        .attr("r", d => {
          if (this.getSelectedState.includes(d.state)) return 6;
          return 4;
        })
        .style("fill", (d) => {
          if (this.getSelectedState.includes(d.state)) return "red";
          return "white";
        })
        .style("stroke","brown")
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
    //The color palette
    getColor(x, y) {
      const colors = [
        ["#98BAE7", "#EED7CE", "#EAEAEA"],
        ["#7267CB", "#ED50F1", "#FFC4E1"],
        ["#6E3CBC", "#FF00E4", "#FF87CA"],
      ];
      return colors[x][y];
    },

    //Depending on the position of the point, save the point + the color it's background has to the store
    calculatePointPosition(data) {
      const mapForStorage = new Map();
      for (var i = 0; i < data.length; i++) {
        var x = this.getXColor(data[i]);
        var y = this.getYColor(data[i]);
        mapForStorage.set(data[i].state, this.getColor(x, y));
      }
      this.$store.commit("addColorToState", mapForStorage);
    },
    // if the point is in the first third, assign first color, and so on
    getXColor(d) {
      const minX = parseInt(this.dataMinX);
      const maxX = parseInt(this.dataMaxX);

      if (d.x <= minX + (maxX - minX) / 3) {
        return 0;
      } else if (d.x <= minX + (2 * (maxX - minX)) / 3) {
        return 1;
      } else {
        return 2;
      }
    },
    getYColor(d) {
      const minY = parseInt(this.dataMinY);
      const maxY = parseInt(this.dataMaxY);
      if (d.y <= minY + (maxY - minY) / 3) {
        return 2;
      } else if (d.y <= minY + (2 * (maxY - minY)) / 3) {
        return 1;
      } else {
        return 0;
      }
    },
  },
  computed: {
    educationRates: {
      get() {
        return this.$store.getters.educationRates;
      },
    },
    getStateColor: {
      get() {
        return this.$store.getters.getColor;
      },
    },
    personalIncome: {
      get() {
        return this.$store.getters.personalIncome;
      },
    },
    getSelectedState: {
      get() {
        return this.$store.getters.selectedStates;
      },
    },
    dataMaxY() {
      return d3.max(this.personalIncome, (d) => d.value);
    },
    dataMinY() {
      return d3.min(this.personalIncome, (d) => d.value);
    },
    dataMaxX() {
      return d3.max(this.educationRates, (d) => d.value);
    },
    dataMinX() {
      return d3.min(this.educationRates, (d) => d.value);
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
        .rangeRound([
          this.svgHeight - this.svgPadding.top - this.svgPadding.bottom,
          0,
        ])
        .domain([this.dataMinY, this.dataMaxY]);
    },
  },
  watch: {
    educationRates: {
      handler() {
        this.drawChart();
      },
      deep: true,
    },
    personalIncome: {
      handler() {
        this.drawChart();
      },
      deep: true,
    },
    getSelectedState: {
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
