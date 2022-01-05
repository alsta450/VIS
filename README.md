# Readme
### How To Start
##### Using terminal
Open the folder dist in a terminal as there is the build version and type
Python 3.x: python -m http.server
Python 2 or lower: python -m SimpleHTTPServer
Access the localhost on the displayed port in your browser
As I only have python 3.x I was only able to test it with python -m http.server

##### Using Almighty
Copy the link http://wwwlab.cs.univie.ac.at/~stadlera95/VIS21W/A3/ in your browser

#### Description
I did not do brushing, but all other tasks.

First I cloned the boilerplate code from the lecture (https://github.com/asilcetin/vis-vue-d3). Then I created the Scatterplot.vue file, adapting everything I needed from the given BarChart.vue file and adding missing features. First I added the points, then the background and finally, calculated the color of the state for the ChoroplethMap, by calculating, if the point is in the first, second or third part of the diagram (for x and y of course). This calculations I saved to the store.
Next I adapted the CholorplethMap.vue file. First I created just the map, then I tried to connect it to the colors from the store. Next I connected it to the year slider, updating the colors, when changing the year.
Finally, when clicking on a State in the Map, the state gets added to selectedStates and Highlighted on the Scatterplot. 

#### References 
As also marked in the Code, in the ChoroplethMap.vue file I adapted about 3-4 lines of code from the link provided by the lecture (https://bl.ocks.org/cmgiven/abca90f6ba5f0a14c54d1eb952f8949c)
      //Line 55-59
      var projection = d3
        .geoAlbersUsa()
        .scale([this.svgWidth + 200])
        .translate([this.svgWidth / 2, this.svgHeight / 2]);
      var path = d3.geoPath().projection(projection);

Pretty simple code, but the idea was from the link. 