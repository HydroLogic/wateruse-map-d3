// set margins for svg
var margin = {
	top: 40,
	right: 20,
	bottom: 85,
	left: 50
}

var width_bar = 1200 - margin.left - margin.right
var height_bar = 500 - margin.top - margin.bottom

var x = d3.scale.ordinal()
	.rangeRoundBands([0, width_bar], 0.1);

var y = d3.scale.linear()
	.range([height_bar, 0]);

var x_axis = d3.svg.axis()
	.scale(x)
	.orient("bottom");

var y_axis = d3.svg.axis()
	.scale(y)
	.orient("left")

var tooltip_bar = d3.select("body")
	.append("div")
	.attr("class", "tooltip-bar");

var svg_bar_chart = d3.select("#bar-chart")
	.append("svg")
	.attr("width", width_bar + margin.left + margin.right)
	.attr("height", height_bar + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("data/2010-us-total-wateruse.csv", function(error, data) {

	x.domain(data.map(function(d) {
		return d.state;
	}));

	y.domain([0, d3.max(data, function(d) {
		return parseFloat(d.value);
	})]);

	svg_bar_chart.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height_bar + ")")
		.call(x_axis)
		.selectAll("text")
		.style("text-anchor", "end")
		.attr("transform", function(d) {
			return "rotate(-45)";
		})

	svg_bar_chart.append("g")
		.attr("class", "y axis")
		.call(y_axis)

	svg_bar_chart.selectAll(".bar")
		.data(data)
		.enter()
		.append("rect")
		.attr("class", "bar")
		.attr("x", function(d) {
			return x(d.state);
		})
		.attr("width", x.rangeBand())
		.attr("y", function(d) {
			return y(d.value);
		})
		.attr("height", function(d) {
			return height_bar - y(d.value);
		})
		.on("mouseover", function(d) {
			return tooltip_bar.style("visibility", "visible")
		  		.style("top", (event.pageY + 10) + "px").style("left", (event.pageX + 10) + "px")
				.text(d.value + " mgd")
		})
		.on("mouseout", function(d) {
			return tooltip_bar.style("visibility", "hidden")
		})

	d3.select("input").on("change", change);

	function change() {
		// if the value of the input checkbox is checked, then x.domain is sorted by highest to lowest values, otherwise it is sorted alphabetically as original data
		var x0 = x.domain(data.sort(this.checked
			? function(a, b) { return b.value - a.value; }
			: function(a, b) { return d3.ascending(a.state, b.state); })
			.map(function(d) {return d.state;} ))
			.copy();

		var transition = svg_bar_chart.transition().duration(750),
			delay = function(d, i) {return i * 50; };

		transition.selectAll(".bar")
			.delay(delay)
			.attr("x", function(d) { return x0(d.state); });

		transition.select(".x.axis")
			.attr("transform", "translate(0," + height_bar + ")")
			.call(x_axis)
			.selectAll("g")
			.selectAll("text")
			.style("text-anchor", "end")
			.attr("transform", function(d) {
				return "rotate(-45)";
			})
			.delay(delay);
	}
})