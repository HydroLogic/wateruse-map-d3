// set width and height of svg element
var width = 1200;
var height = 600;

// create projection
var projection = d3.geo.albersUsa()
	.translate([width / 2, height / 2])
	.scale([1300]);

// create path generator; converts geojson to svg path's ("M 100 100 L 300 100 L 200 300 z")
var path = d3.geo.path()
	.projection(projection);

// create an svg element to the body of the html
var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);

// add a tooltip
var tooltip = d3.select("body")
	.append("div")
	.attr("class", "tooltip");

// create a quantize scale (function) to sort data values into buckets of color
var color = d3.scale.quantize()
	// .range(["rgb(237,248,233)","rgb(186,228,179)","rgb(116,196,118)","rgb(49,163,84)","rgb(0,109,44)"]);
	.range(["rgb(247,251,255)", "rgb(222,235,247)", "rgb(198,219,239)", "rgb(158,202,225)", "rgb(107,174,214)", "rgb(66,146,198)", "rgb(33,113,181)", "rgb(8,81,156)", "rgb(8,48,107)"]);
// function to calculate a color based on the ag productivity from data/us-ag-productivity-2004.csv file
function calculate_color(d) {

	var value = d.properties.value;

	if (value) {
		return color(value);
	} else {
		return "#ccc"; // grayish
	}
}

// load the agriculture data
d3.csv("data/2010-us-total-wateruse.csv", function(wateruse_data) {

	// set the input domain for the color scale
	color.domain([
		d3.min(wateruse_data, function(d) {	return parseFloat(d.value); }),
		d3.max(wateruse_data, function(d) { return parseFloat(d.value); })
		]);

	// load the data file; note path is relative from index.html
	d3.json("data/us-states.json", function(error, json) {

		if (error) { return console.error(error) };	

		// merge the ag. data and geojson
		for (var i = 0; i < wateruse_data.length; i++) {

			// get the state name
			var wateruse_data_state = wateruse_data[i].state;

			// get the data value and convert from string to float
			var wateruse_data_value = parseFloat(wateruse_data[i].value);

			// find the corresponding state inside the geojson
			for (var j = 0; j < json.features.length; j++) {

				// get the json state name
				var json_data_state = json.features[j].properties.name;

				if (wateruse_data_state === json_data_state) {

					// copy the ag data value into the the json
					json.features[j].properties.value = wateruse_data_value;

					// stop looking through the geojson
					break;
				}
			}	
		}
		
		// bind the data and create one path for each geojson feature
		svg.selectAll("path")
			.data(json.features)
			.enter()
			.append("path")
			.attr("d", path)
			.attr("fill", calculate_color);

		svg.selectAll("path")
			.data(json.features)
			.on("mouseover", function(d) {
				d3.select(this)
					.transition().duration(500)
					.attr("fill", "orange")
					.attr("stroke-width", 3)
				d3.select("#statename").text(d.properties.name)
				d3.select("#statevalue").text(d.properties.value + " mgd");
			})
			.on("mouseout", function(d) {
				d3.select(this)
					.transition().duration(500)
					.attr("fill", calculate_color)
					.attr("stroke-width", 1)
		  		return tooltip.style("visibility", "hidden");
			})
			.on("click", function(d) {	// display a tooltip
		  		return tooltip.style("visibility", "visible")
		  				.text(d.properties.name + " = " + d.properties.value + " mgd");
		  	})
		  	.on("mousemove", function() {
		  		return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");
		  	});
	});
});