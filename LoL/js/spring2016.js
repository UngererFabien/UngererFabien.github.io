$(function () {

    function filterGolds (games, attr) {
    	return _.where(games, attr);
    }

    function getGamesAverageGolds (games) {
    	var points = [];

    	_.each(games, function (game) {
    		_.each(game.golds, function (gold) {
    			if(gold.x <= 30) {
	    			var point = _.find(points, function (p) {
	    				return p.x == gold.x;
	    			});

	    			if(point) {
	    				point.y += gold.y;
	    				point.count += 1
	    			} else {
	    				points.push({
		    				x: gold.x,
		    				y: gold.y,
		    				count: 1
		    			});
		    		}
		    	}
    		});
    	});

    	_.each(points, function (point) {
    		point.y = point.y/point.count;
    	});

    	return points;
    }

    function getTeamAverageGolds (team, name) {
    	var lines = [];

    	var winGames = filterGolds(team.games, {win: true}),
    		winGolds = getGamesAverageGolds(winGames);

    	lines.push({
    		points: winGolds,
    		id: 'win_'+name,
    		name: 'WIN'
    	});

    	var loseGames = filterGolds(team.games, {win: false}),
    		loseGolds = getGamesAverageGolds(loseGames);

    	lines.push({
    		points: loseGolds,
    		id: 'lose_'+name,
    		name: 'LOSE'
    	});

    	lines.push({
    		points: getGamesAverageGolds(team.games),
    		id: 'all_'+name,
    		name: 'All'
    	})

    	return lines;
    }

    d3.json('./datasets/spring2016Golds.json', function (err, teams) {
    	if(err) return false;

    	_.each(teams, function (team, name) {

    		var container = $('<div class="team-container"></div>');

    		var chartId = name+'-golds'

    		container.append('<h4>'+name+'</h4>');
    		container.append('<div id="'+chartId+'" class="chart"></div>');

    		$('.golds-viz').append(container);

    		var chart = d3.select('#'+chartId)
		        .append('svg')
		        .attr('width', 700)
		        .attr('height', 300)
		        .chart('LineChart');

		    chart.draw(getTeamAverageGolds(team, name));
    	});
    });
    
});