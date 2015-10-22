var playerPpt = [
	'name',
	'team',
	'position',
	'kda',
	'kills',
	'deaths',
	'assists',
	'kill_participation',
	'cs_per_min',
	'cs',
	'min_played',
	'games_played'
]

var Player = function (arrPpt) {
	var _this = this;

	_.each(playerPpt, function (ppt, i) {
		_this[ppt] = arrPpt[i];
	})
}

_.each(players, function (player) {playersColl.push(new Player(player))})