d3.chart('BarChart', {

  initialize: function () {
    var _this = this;

    var margin = {bottom: 50};

    var svg = this.base.node();
    this.width = +svg.getAttribute('width');
    this.height = +svg.getAttribute('height');

    this.scaleX = d3.scale.ordinal()
      .rangeBands([0, this.width], 0.33, 0.33);

    this.scaleY = d3.scale.linear()
      .range([this.height - margin.bottom, 0]);

    this.xAxis = d3.svg.axis()
      .scale(this.scaleX)
      .orient('bottom')
      .tickFormat(function (d) {
        return d;
      })
      .outerTickSize(0);
      //.innerTickSize(6)
      // .tickPadding(10);

    // a new group element on the base of the chart
    this.layer('VerticalBars', this.base.append('g'), {

      // select the elements we wish to bind to and
      // bind the data to them.
      dataBind: function (data) {
        return this.selectAll('.bar')
          .data(data, function (point, i) {
            return point.id;
          });
      },

      insert: function () {
        return this.append('rect')
          .attr('class', 'bar');
      },

      // define lifecycle events
      events: {
        'first:enter': function () {
          var chart = this.chart(),
            maxIndex = this.size() - 1;

          this.attr('x', function (point, i) {
              return chart.scaleX(point.label) // + chart.scaleX.rangeBand()*2;
            }).attr('width', chart.scaleX.rangeBand())
            .attr('y', function (point) {
              return chart.height - margin.bottom - 1; // For animation
              // return chart.scaleY(point.value) + 1;
            }).attr('height', function (point) {
              return 1 // For animation
              // return chart.height - margin.bottom - chart.scaleY(point.value);
            });
        },

        enter: function () {
          var chart = this.chart();

          this.attr('x', function (point, i) {
              return chart.scaleX(point.label) // + chart.scaleX.rangeBand()*2;
            }).attr('width', chart.barWidth)
            .attr('y', function (point) {
              return chart.height - margin.bottom - 1; // For animation
              // return chart.scaleY(point.value) + 1;
            }).attr('height', function (point) {
              return 1 // For animation
              // return chart.height - margin.bottom - chart.scaleY(point.value);
            });

        },

        'exit:transition': function () {
          // console.log('exit', this);

          var chart = this.chart();

          this.duration(1000)
            .attr('x', function (point, i) {
              return -chart.scaleX.rangeBand()*2;
            }).remove();
        },

        'merge:transition': function () {
          // console.log('merge:transition');

          var chart = this.chart();

          // Keep this animation for Y rescaling
          this.duration(1000)
            .attr('x', function (point, i) {
              return chart.scaleX(point.label)
            }).attr('width', chart.scaleX.rangeBand())
            .attr('y', function (point) {
              return chart.scaleY(point.value) + 1;
            }).attr('height', function (point) {
              return chart.height - margin.bottom - chart.scaleY(point.value);
            });
        }
      }
    });

    this.svgXAxis = this.base.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(' + (0) + ',' + (this.height-margin.bottom) + ')');

  },

  transform: function (data) {
    var max = d3.max(data, function (point) {
      return point.value;
    });

    this.scaleX.domain(data.map(function (d) {return d.label}));
    this.scaleY.domain([0, max]);

    this.xAxis.tickValues(data.map(function (d) {return d.label}));
    this.svgXAxis.call(this.xAxis)
      // .selectAll('text')
      //   .attr('y', 10)
      //   .attr('x', 15)
      //   .attr('transform', 'rotate(30)');

    return data;
  }

});