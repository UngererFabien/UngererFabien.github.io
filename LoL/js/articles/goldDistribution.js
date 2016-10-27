$(function () {

	function renderRadar (el, data) {
		var chart = RadarChart.chart();
		chart.config({minValue: 10, w: 400, h: 400});

		var cfg = chart.config();

		var svg = d3.select('#'+el).append('svg')
			.attr('width', cfg.w+30)
			.attr('height', cfg.h+20);
		svg.append('g').classed('single', 1).datum(data).call(chart);

		return chart;
	}

	function avgFromData (axes, data, attr) {
		var total = 0;

		_.forEach(data, function (d) {
			_.forEach(d.axes, function (axis) {
				var _a = _.find(axes, function (a) {
					return a.axis == axis.axis;
				});

				if(_a) {
					_a.value += axis[attr];
					total += axis[attr];
				}
			});
		});

		_.forEach(axes, function (axis) {
			axis.value = Math.round(axis.value/total*10000)/100;
		});

		return axes;
	}

	function avgTeam (axes, teamName, data, attr) {
		var d = _.find(data, function (team) {
			return team.className == teamName;
		});

		return avgFromData(axes, [d], attr);
	}

	function createAxes (names) {
		var axes = [];

		_.forEach(names, function (name) {
			axes.push({axis: name, value: 0});
		});

		return axes;
	}

	d3.json('../datasets/articles/gold-distribution.json', function (err, data) {

		function setupController (chart, nb, avgData, axesNames, attr) {
			$('.js-controller'+nb).on('change', function (e) {
				var teamA = $('.js-controller'+nb+'.js-A').val(),
					teamB = $('.js-controller'+nb+'.js-B').val();

				var TeamA = teamA == 'AVG' ? avgData : avgTeam(createAxes(axesNames), teamA, data, attr);

				var TeamB = teamB == 'AVG' ? avgData : avgTeam(createAxes(axesNames), teamB, data, attr);

				d3.select('#chart'+nb+' svg').datum([
					{className: teamA, axes: TeamA},
					{className: teamB, axes: TeamB}
				]).call(chart)
			});
		}

		_.forEach(data, function (team) {
			$('.js-select-team').append('<option>'+team.className+'</option>');
		});

		var roughtAxes = avgFromData([
			{axis: 'Mid', value: 0}, 
		    {axis: 'ADC', value: 0}, 
		    {axis: 'Support', value: 0},  
		    {axis: 'Jungle', value: 0},  
		    {axis: 'Top', value: 0}
		], data, 'rought');

		// CHART 1
		var chart1 = renderRadar('chart1', [{axes: roughtAxes}]);

		setupController(chart1, 1, roughtAxes, [
			'Mid', 'ADC', 'Support', 'Jungle', 'Top'
		], 'rought');

		var cleanAxes = avgFromData([
			{axis: 'Mid', value: 0}, 
		    {axis: 'ADC', value: 0}, 
		    {axis: 'Support', value: 0},  
		    {axis: 'Jungle', value: 0},  
		    {axis: 'Top', value: 0}
		], data, 'clean');

		// CHART 2
		renderRadar('chart2', [
			{className: 'rought', axes: roughtAxes},
			{className: 'clean', axes: cleanAxes}
		]);

		// NO SUPP DATA
		var noSuppAxes = avgFromData([
			{axis: 'Mid', value: 0}, 
		    {axis: 'ADC', value: 0}, 
		    {axis: 'Jungle', value: 0},  
		    {axis: 'Top', value: 0}
		], data, 'clean');

		renderRadar('chart3', [{axes: noSuppAxes}]);

		var noSuppWinAxes = avgFromData([
			{axis: 'Mid', value: 0}, 
		    {axis: 'ADC', value: 0}, 
		    {axis: 'Jungle', value: 0},  
		    {axis: 'Top', value: 0}
		], data, 'win');

		var noSuppLoseAxes = avgFromData([
			{axis: 'Mid', value: 0}, 
		    {axis: 'ADC', value: 0}, 
		    {axis: 'Jungle', value: 0},  
		    {axis: 'Top', value: 0}
		], data, 'lose');

		renderRadar('chart4', [
			{className: 'lose', axes: noSuppLoseAxes},
			{className: 'win', axes: noSuppWinAxes}
		]);

		var TeamA, TeamB;

		var chart5 = renderRadar('chart5', [
			{className: 'AVG', axes: noSuppAxes},
			{className: 'AVG', axes: noSuppAxes},
		]);

		setupController(chart5, 5, noSuppAxes, [
			'Mid', 'ADC', 'Jungle', 'Top'
		], 'clean');
	});
})