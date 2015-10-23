(function () {

	var barAvg = [
		{nestAttr: 'team', attr: 'kda'},
		{nestAttr: 'team', attr: 'cs_per_min'},
		{nestAttr: 'position', attr: 'kda'},
		{nestAttr: 'position', attr: 'cs_per_min'},
	]

	var allPlayers;

	function getNestDataByAttrAndCat (players, nestAttr, attr, cat) {
		var data = [];

		nestedPlayers = d3.nest().key(function (d) {
			return d[nestAttr];
		}).entries(players);

		for (var i = nestedPlayers.length - 1; i >= 0; i--) {
			var nest = nestedPlayers[i];

			data.push({
				value: d3.sum(nest.values, function (player) {
					return player[attr];
				})/nest.values.length,
				label: nest.key,
				cat: 'all',
				id: nest.key
			});
		};

		data.sort(function (a, b) {
			return b.value - a.value;
		});

		return data;
	}

	function getPlayersDataByAttrAndCat (players, attr, cat) {
		var data = [];

		for (var i = players.length - 1; i >= 0; i--) {
			var player = players[i];

			data.push({
				value: player[attr],
				label: player.name,
				cat: player[cat],
				id: player.name+player.team
			});
		};

		return data;
	}

	d3.json('./playersGroupStage.json', function (err, players) {
		allPlayers = players;

		for (var i = barAvg.length - 1; i >= 0; i--) {
			barAvg[i].chart = d3.select('.barAvg-'+barAvg[i].nestAttr+'-'+barAvg[i].attr)
				.append('svg')
				.attr('width', 900)
				.attr('height', 500)
				.chart('BarAveragesChart');

			barAvg[i].chart.draw(getNestDataByAttrAndCat(allPlayers, barAvg[i].nestAttr, barAvg[i].attr, 'all'))
		};
	});
})();