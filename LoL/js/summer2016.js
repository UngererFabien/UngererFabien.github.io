$(function () {
	d3.json('../datasets/'+window.dataset+'.json', function (err, data) {
		var maxValues = {
		    className: 'MAX',
			axes: [
				{axis: 'Mid', value: 25}, 
			    {axis: 'ADC', value: 25}, 
			    {axis: 'Support', value: 25},  
			    {axis: 'Jungle', value: 25},  
			    {axis: 'Top', value: 25}
			]
		}

		var avgValues = {
			className: 'AVG',
			axes: [
				{axis: 'Mid', value: 0}, 
			    {axis: 'ADC', value: 0}, 
			    {axis: 'Support', value: 0},  
			    {axis: 'Jungle', value: 0},  
			    {axis: 'Top', value: 0}
			]
		}

		_.each(data, function (team) {
			_.each(team.axes, function (axis, i) {
				avgValues.axes[i].value += axis.value;
			});
		});

		_.each(avgValues.axes, function (axis) {
			axis.value = Math.round(axis.value/data.length*100)/100;
		});

		// data.push(maxValues);
		// data.push();

		_.each(data,function (team) {
			var name = team.className;

			var container = $('<div class="team-container"></div>');

    		var chartId = name+'-golds'

    		container.append('<h4>'+name+'</h4>');
    		container.append('<div id="'+chartId+'" class="chart radar"></div>');

    		$('.js-viz').append(container);

			var chart = RadarChart.chart();
			
			chart.config({minValue: 12})

			var cfg = chart.config();

			var chartData = [
				maxValues,
				avgValues,
				team
			]

			var svg = d3.select('#'+chartId).append('svg')
				.attr('width', cfg.w+20)
				.attr('height', cfg.h);
			svg.append('g').classed('single', 1).datum(chartData).call(chart);
		});

		// var chart = RadarChart.chart(),
		// 	cfg = chart.config();

		// var svg = d3.select('#viz').append('svg')
		// 	.attr('width', cfg.w+20)
		// 	.attr('height', cfg.h);
		// svg.append('g').classed('single', 1).datum(data).call(chart);
	});
})