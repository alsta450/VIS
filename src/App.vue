<template>
  <div id="app">
    <div class="container-fluid">

      <div class="row">
        <div class="col-md-5">
          <ChoroplethMap/>
        </div>
        <div class="col-md-5">
          <Scatterplot/>
        </div>
      </div>
            <div class="row">
        <div class="col-md-5">
          <BarChart/>
        </div>
                <div class="col-md-5">
          <LinePlot/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Scatterplot from './components/Scatterplot.vue';
import ChoroplethMap from './components/ChoroplethMap.vue';
import BarChart from './components/BarChart.vue';
import LinePlot from './components/LinePlot.vue';

export default {
  name: 'App',
  components: {
     ChoroplethMap,  BarChart , LinePlot, Scatterplot
  },
  mounted() {
    this.$store.dispatch('loadData');
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 20px;
}
</style>
