d3.chart('SwimLaneChart', {

  initialize: function () {
    var _this = this;

    var margin = {bottom: 30, left: 30, right:20};

    var svg = this.base.node();
    this.width = +svg.getAttribute('width');
    this.height = +svg.getAttribute('height');

    this.x = d3.scale.linear()
      .range([this.width - margin.left - margin.right, 0]);

    this.y = d3.scale.linear()
      .range([this.height - margin.bottom, 0]);

    this.xAxis = d3.svg.axis()
      .scale(this.x)
      .orient('bottom')
      .tickFormat(function (a, b, c) {
        return Math.floor(a/60)+':'+(a%60);
      });

    this.layer('MainLanes', this.base.append('g'), {

      dataBind: function (data) {
        return this.selectAll('.lane')
          .data(data, function (lane) {
            return lane.id
          });
      },

      insert: function () {
        var g = this.append('g')
          .attr('class', 'lane');

        g.append('text')
          .attr('class', 'lane-label');

        g.append('g')
          .attr('class', 'lane-rects');

        return g;
      },

      // define lifecycle events
      events: {
        enter: function () {
          var chart = this.chart();

          this.attr('transform', function (lane, index) {
            return 'translate(0,'+(chart.y(index)-margin.bottom)+')'
          });

          this.select('.lane-label').text(function (lane) {
            return lane.id;
          }).attr('y', (chart.height - margin.bottom - chart.y(1))/2)
            .attr('x', 0);

          this.each(function (lane, index) {
            var g = d3.select(this);
            rects = g.select('.lane-rects')
              .attr('transform', 'translate('+margin.left+', 0)');

            for (var i = 0; i < lane.events.length; i++) {
              var event = lane.events[i];

              var eventG = rects.append('g');

              eventG.attr('transform', 'translate('+chart.x(event.start)+', 0)')

              eventG.append('rect')
                .attr('class', 'bar')
                .attr('width', chart.x(100+event.end-event.start))
                .attr('height', chart.height - margin.bottom - chart.y(1)-5);

              eventG.append('text').text(event.name)
                .attr('y', 10);
            }
          });
        }
      }
    });

    this.svgXAxis = this.base.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(' + (margin.left) + ',' + (this.height- margin.bottom+5) + ')')

  },

  transform: function (data) {
    this.x.domain([480, 100]);
    this.y.domain([0, data.length]);

    this.svgXAxis.call(this.xAxis);

    return data;
  }

});