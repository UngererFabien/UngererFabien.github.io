d3.chart('BarChart', {

  initialize: function () {

    var svg = this.base.node(),
      width = +svg.getAttribute('width'),
      height = +svg.getAttribute('height');

    var nbBar = 10,
      barSpace, barWidth, barMargin;

    barSpace = width / nbBar;
    barMargin = width / ((nbBar * 2) + nbBar + 1);
    barWidth = barMargin * 2;

    this.scaleX = d3.scale.linear()
      .domain([0, 1])
      .range([0, barSpace]);

    this.scaleY = d3.scale.linear()
      .range([height, 0]);

    // a new group element on the base of the chart
    this.layer('VerticalBars', this.base.append('g'), {

      // select the elements we wish to bind to and
      // bind the data to them.
      dataBind: function (data) {
        // console.log(data);
        return this.selectAll('.bar')
          .data(data, function (point, i) {
            // console.log('data bind : ', point.id, i);
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
              return (i == maxIndex ? chart.scaleX(i + 1) : chart.scaleX(i)) + barMargin / 2;
            }).attr('width', barWidth)
            .attr('y', function (point) {
              // return height-1; // For animation
              return chart.scaleY(point.value) + 1;
            }).attr('height', function (point) {
              // return 1 // For animation
              return height - chart.scaleY(point.value);
            });
        },

        enter: function () {
          var chart = this.chart();

          this.attr('x', function (point, i) {
              return chart.scaleX(i + 1) + barMargin;
            }).attr('width', barWidth)
            .attr('y', function (point) {
              // return height-1; // For animation
              return chart.scaleY(point.value) + 1;
            }).attr('height', function (point) {
              // return 1 // For animation
              return height - chart.scaleY(point.value);
            });

        },

        'enter:transition': function () {

        },

        update: function () {

        },

        'update:transition': function () {

        },

        exit: function () {

        },

        'exit:transition': function () {
          //console.log('exit', this);

          var chart = this.chart();

          this.duration(1000)
            .attr('x', function (point, i) {
              return chart.scaleX(i - 1);
            }).remove();
        },

        merge: function () {

        },

        'merge:transition': function () {
          // console.log('merge:transition');

          var chart = this.chart();

          // Keep this animation for Y rescaling
          this.duration(1000)
            .attr('x', function (point, i) {
              return chart.scaleX(i) + barMargin / 2;
            }).attr('y', function (point) {
              return chart.scaleY(point.value) + 1;
            }).attr('height', function (point) {
              return height - chart.scaleY(point.value);
            });
        }
      }
    });

    this.base.append('svg:line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', height)
      .attr('y2', height)
      .attr('stroke', '#000');
  },

  transform: function (data) {
    var max = d3.max(data, function (point) {
      return point.value;
    });

    // this.scaleX.domain(data.map(function (point) {
    //   return point.id;
    // }));

    this.scaleY.domain([0, max]);

    return data;
  }

});