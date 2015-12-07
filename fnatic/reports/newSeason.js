(function () {
	var lines = [
		{id: 'winRate'},
		{id: 'playRate'}
	];

	var positions = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'];

	var champions;

	function getLines (ppt) {
		var championLines = [];

		_.each(champions, function (champion) {
			var championLine = {
				id: champion.name+'-'+champion.position,
				name: champion.name+' - '+champion.position,
				points: []
			};

			_.each(champion.patchs, function (patch) {
				championLine.points.push({
					x: patch.id,
					y: patch[ppt]
				})
			});

			championLines.push(championLine);
		});

		return championLines;
	}

	function drawLines () {
		for (var i = lines.length - 1; i >= 0; i--) {
			var line = lines[i];

			line.chart.draw(getLines(line.id));
		};
	}

	d3.json('./json/champions.json', function (err, _champions) {
		champions = _champions;

		for (var i = lines.length - 1; i >= 0; i--) {
			var line = lines[i];

			line.chart = d3.select('.line-'+line.id)
				.append('svg')
				.attr('width', 900)
				.attr('height', 500)
				.chart('LineChart');
		};

		drawLines();
	});
})();