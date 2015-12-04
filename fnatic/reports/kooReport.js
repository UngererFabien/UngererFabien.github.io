(function () {

	var barAvg = [
		{attr: 'kda', cat: 'team'},
		{attr: 'cs_per_min', cat: 'team'},
		{attr: 'kill_participation', cat:'team'}
		// {attr: 'egpm', cat: 'team'}
	]

	var allPlayers;

	function getSumForTeamByAttr (players, team, attr) {
		return d3.sum(players, function (player) {
			return player.team == team ? player[attr] : 0;
		})
	}

	function getPlayersFromTeams (players, teams) {
		var _players = [];

		for (var i = players.length - 1; i >= 0; i--) {
			var player = players[i];

			for (var j = teams.length - 1; j >= 0; j--) {
				var team = teams[j];

				if(player.team == team) _players.push(player);
			};
		};

		return _players;
	}

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

	function getCatsbubbles (players, cats) {
		var data = {
			id: 'CatsBubbles',
			_children: []
		}

		for (var i = cats.length - 1; i >= 0; i--) {
			var cat = cats[i];

			var subCat = {
				id: cat,
				_children: []
			}

			for (var j = players.length - 1; j >= 0; j--) {
				var player = players[j];

				subCat._children.push({
					id: player.name+cat,
					label: player.name,
					value: player[cat]
				});
			};

			data._children.push(subCat);
		};

		return data;

	}

	function getDataByAttrAndCat (players, attr, cat) {
		var data = [];

		for (var i = players.length - 1; i >= 0; i--) {
			var player = players[i];

			data.push({
				value: player[attr],
				label: player.name,
				cat: player[cat],
				id: player.name,
				color: player.team == 'FNC' ? '#FFC203' : undefined
			});
		};

		data.sort(function (a, b) {
			return b.value - a.value;
		});

		return data;
	}

	d3.json('./json/players.json', function (err, players) {
		allPlayers = players;

		var teams = ['FNC', 'KOO'];

		// console.log('SKT kills', getSumForTeamByAttr(allPlayers, 'SKT', 'kills'));
		// console.log('KOO kills', getSumForTeamByAttr(allPlayers, 'KOO', 'kills'));

		var vsPlayers = getPlayersFromTeams(allPlayers, teams);

		for (var i = barAvg.length - 1; i >= 0; i--) {
			barAvg[i].chart = d3.select('.barAvg-players-'+barAvg[i].attr)
				.append('svg')
				.attr('width', 900)
				.attr('height', 500)
				.chart('BarAveragesChart');

			barAvg[i].chart.draw(getDataByAttrAndCat(vsPlayers, barAvg[i].attr, barAvg[i].cat));
		};

		for (var i = teams.length - 1; i >= 0; i--) {
			var team = teams[i];

			var chart = d3.select('.bubbles-KDA-'+team)
				.append('svg')
				.attr('width', 450)
				.attr('height', 450)
				.chart('BubblesChart');

			chart.draw(getCatsbubbles(getPlayersFromTeams(vsPlayers, [team]), ['kills', 'deaths', 'assists']));
		};

	})
	
})();