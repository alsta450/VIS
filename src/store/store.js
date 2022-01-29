import Vue from "vue";
import Vuex from "vuex";
import * as d3 from "d3";

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    selectedYear: 2006,
    selectedStates: [],
    stateColor: new Map(),
    covid_data: [],
    barData: [],
    scatterData: [],
    lineData: []
  },
  mutations: {
    changeSelectedYear(state, year) {
      state.selectedYear = year;
    },
    changeSelectedState(state, val) {
      state.selectedStates.push(val);
    },
    addColorToState(state, map) {
      state.stateColor = map;
    },
    resetSelectedStates(state) {
      state.selectedStates = [];
      state.lineData = [];
      state.barData = [];
    },
    removeState(state, val) {
      state.selectedStates = state.selectedStates.filter(value => value !== val)
    },
    addbardata(state, val) {
      for (var i = state.covid_data.length - 1; i >= 0; --i) {
        if (val == state.covid_data[i].location) {
          if (! (state.covid_data[i].icu_patients_per_million == "")) {
            state.barData.push({
              state: val,
              icu: +state.covid_data[i].icu_patients_per_million.replace(".",""),
              smokers: +state.covid_data[i].male_smokers.replace(".","") + +state.covid_data[i].female_smokers.replace(".","")
            }
            );
            break;
          }
        }
      }

    },

    

    addLineData(state,val){
      var tempMax = 0;
      var tempDate = NaN;
      var parseDate = d3.timeParse("%Y-%m-%d");
      var temp = {State: val, values:[],max:0, maxDate:parseDate("2000-01-01"), minDate:parseDate("2030-01-01")};
      var tempForSmooth = 0;
      var tempForVaccRate = 0;
      for (var i = 0; i < state.covid_data.length; ++i) {
        if (val == state.covid_data[i].location) {

            temp["GDP"]=+state.covid_data[i].gdp_per_capita.replace(".","");



          var tempVacc = +state.covid_data[i].new_vaccinations_smoothed_per_million;
          tempDate = parseDate(state.covid_data[i].date);
          if(tempDate > temp["maxDate"]){
            temp["maxDate"] = tempDate;
          }
          if(tempDate < temp["minDate"]){
            temp["minDate"] = tempDate;
          }
          tempMax = +state.covid_data[i].new_cases_smoothed_per_million.replace(".","");
          if(tempMax > temp["max"]){
            temp["max"] = tempMax;
          }
          var tempCase =  +state.covid_data[i].new_cases_smoothed_per_million.replace(".","");


          if(tempCase < 0){
            tempCase=0;
          }

          if(tempCase < tempForSmooth*0.4){
            tempCase = tempForSmooth;
          }
          if(tempVacc<0){
            tempVacc = 0;
          }

          var tempVaccRate = +state.covid_data[i].people_fully_vaccinated_per_hundred;
          if(tempVaccRate < tempForVaccRate){
            tempVaccRate = tempForVaccRate
          }
          temp["values"].push({year:parseDate(state.covid_data[i].date) ,cases:tempCase,vacc:tempVacc, vacc_percentage:tempVaccRate})
          tempForSmooth = tempCase;
          tempForVaccRate = tempVaccRate;
        }
      }
      state.lineData.push(temp);

    },



  },
  getters: {
    getScatterData: (state) => state.scatterData,
    getLineData: (state) => state.lineData,
    getBarData: (state) => state.barData,
    covid(state) { return state.covid_data },
    selectedYear: (state) => state.selectedYear,
    selectedStates: (state) => state.selectedStates,
    getColor(state) {
      return state.stateColor;
    },

  },
  actions: {
    loadData({ state }) {


      d3.csv("./owid-covid-data.csv").then((data) => {
        state.covid_data = data;

        let returnMap = new Map();

        for (let i = data.length - 1; i >= 0; --i) {
          if (!returnMap.has(data[i].location)) {
            if (!data[i].icu_patients_per_million == "") {
              if(!data[i].diabetes_prevalence == ""){
              returnMap.set(data[i].location, {
                location: data[i].location,
                diabetes_prevalence:
                  +data[i].diabetes_prevalence.replace(".",""),
                icu_patients: +data[i].icu_patients_per_million.replace(".",""),
              });
            }
            }
          }
        }
        state.scatterData =  Array.from(returnMap.values());


      });
    },
  },
});

export default store;
