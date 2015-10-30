(function () {

	var barAvg = [
		{nestAttr: 'team', attr: 'kda'},
		{nestAttr: 'team', attr: 'cs_per_min'},
		{nestAttr: 'position', attr: 'kda'},
		{nestAttr: 'position', attr: 'cs_per_min'},
	]

	var sunburst = [
		// {cat: 'team', attr: 'kills'}
	]

	var bubbles = [
		{cat: 'team', attr: 'kills'},
		{cat: 'position', attr: 'kills'},
		{cat: 'team', attr: 'deaths'},
		{cat: 'position', attr: 'deaths'},
		{cat: 'team', attr: 'assists'},
		{cat: 'position', attr: 'assists'},
		{cat: 'team', attr: 'cs'},
		{cat: 'position', attr: 'cs'}
	]

	var allPlayers;

	function getNestedPlayersByCat (players, cat) {
		return d3.nest().key(function (d) {
			return d[cat];
		}).entries(players);
	}

	function getTreeForAttrByCatAndPlayers (players, attr, cat) {
		var data = {
			id: cat,
			_children: []
		}

		var nestedPlayers = getNestedPlayersByCat(players, cat);

		for (var i = nestedPlayers.length - 1; i >= 0; i--) {
			var nest = nestedPlayers[i];

			var subCat = {
				id: nest.key,
				_children: []
			}

			for (var j = nest.values.length - 1; j >= 0; j--) {
				var player = nest.values[j]

				subCat._children.push({
					id: player.name,
					value: player[attr]
				})
			};

			data._children.push(subCat);

		};

		return data;
	}

	function getNestDataByAttrAndCat (players, nestAttr, attr, cat) {
		var data = [];

		var nestedPlayers = getNestedPlayersByCat(players, nestAttr);

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

	d3.json('./json/playersGroupStage.json', function (err, players) {
		allPlayers = players;

		for (var i = barAvg.length - 1; i >= 0; i--) {
			barAvg[i].chart = d3.select('.barAvg-'+barAvg[i].nestAttr+'-'+barAvg[i].attr)
				.append('svg')
				.attr('width', 900)
				.attr('height', 500)
				.chart('BarAveragesChart');

			barAvg[i].chart.draw(getNestDataByAttrAndCat(allPlayers, barAvg[i].nestAttr, barAvg[i].attr, 'all'))
		};

		for (var i = sunburst.length - 1; i >= 0; i--) {
			sunburst[i].chart = d3.select('.sunburst-'+sunburst[i].cat+'-'+sunburst[i].attr)
				.append('svg')
				.attr('width', 900)
				.attr('height', 500)
				.chart('SunburstChart');

			sunburst[i].chart.draw(getTreeForAttrByCatAndPlayers(players, sunburst[i].attr, sunburst[i].cat))
		};

		for (var i = bubbles.length - 1; i >= 0; i--) {
			bubbles[i].chart = d3.select('.bubbles-'+bubbles[i].cat+'-'+bubbles[i].attr)
				.append('svg')
				.attr('width', 450)
				.attr('height', 450)
				.chart('BubblesChart');

			bubbles[i].chart.draw(getTreeForAttrByCatAndPlayers(players, bubbles[i].attr, bubbles[i].cat))
		};

		// getTreeForAttrByCatAndPlayers(players, 'kills', 'team');
	});
})();