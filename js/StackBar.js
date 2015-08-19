d3.chart('StackBarChart', {

  initialize: function() {

    var svg = this.base.node(),
      width = +svg.getAttribute('width'),
      height = +svg.getAttribute('height') - 20;

    var nbBar = 10,
      barSpace, barWidth, barMargin;

    barSpace = width / nbBar;
    barMargin = width / ((nbBar * 2) + nbBar + 1);
    barWidth = barMargin * 2;

    var colors = ['default', 'green', 'orange'];

    this.scaleX = d3.scale.linear()
      .domain([0, 1])
      .range([0, barSpace]);

    this.scaleY = d3.scale.linear()
      .range([height, 0]);

    // a new group element on the base of the chart
    this.layer('VerticalStackedBars', this.base.append('g'), {

      // select the elements we wish to bind to and
      // bind the data to them.
      dataBind: function(data) {
        return this.selectAll('.bars')
          .data(data, function(point, i) {
            return point.id;
          });
      },

      insert: function() {
        return this.append('g')
          .attr('class', 'bars');
      },

      // define lifecycle events
      events: {
        'first:enter': function() {
          var chart = this.chart(),
            maxIndex = this.size() - 1;

          this.each(function (point, i) {
            var g = d3.select(this),
              // x = (i == maxIndex ? chart.scaleX(i + 1) : chart.scaleX(i)) + barMargin / 2;
              x = chart.scaleX(i + 1) + barMargin / 2;
            
            g.attr('transform', 'translate('+x+', 0)');

            // g.append('text').attr('class', 'barXLabel')
            //   .attr('text-anchor', 'middle')
            //   .attr('x', barMargin)
            //   .attr('y', height + 17).text(point.id);

            point.values.reduce(function (a, b, n) {
              var sum = a+b;
              chart.addStackedBar.apply(g, [
                barWidth,
                height - chart.scaleY(b),
                barMargin,
                chart.scaleY(sum),
                colors[n],
                b
              ])

              return sum;
            }, 0);

          });
        },

        enter: function() {
          var chart = this.chart(),
            size = this.size();

          this.each(function (point, i) {
            var g = d3.select(this),
              x = chart.scaleX(i + size) + barMargin;

            g.attr('transform', 'translate('+x+', 0)');

            // g.append('text').attr('class', 'barXLabel')
            //   .attr('text-anchor', 'middle')
            //   .attr('x', barMargin)
            //   .attr('y', height + 17).text(point.id);

            point.values.reduce(function (a, b, n) {
              var sum = a+b;
              chart.addStackedBar.apply(g, [
                barWidth,
                height - chart.scaleY(b),
                barMargin,
                chart.scaleY(sum),
                colors[n],
                b
              ])

              return sum;
            }, 0);

          });

        },

        'exit:transition': function(a, b, c) {
          var chart = this.chart(),
            size = this.size();

          // console.log(this.size());

          this.duration(1000).attr('transform', function (point, i) {
            var x = chart.scaleX(i - size) + barMargin / 2;
            return 'translate('+x+', 0)';
          }).remove();
        },

        'merge:transition': function() {
          // Keep this animation for Y rescaling
          var chart = this.chart();

          this.duration(1000).attr('transform', function (point, i) {
            var x = chart.scaleX(i) + barMargin / 2;
            return 'translate('+x+', 0)';
          });

          this.each(function (point, i) {
            var g = d3.select(this);
            var bars = g.selectAll('.bar').transition();

            var reduceValues = [];
            var pointSum = point.values.reduce(function (a, b) {
              var sum = a+b;
              reduceValues.push(sum);
              return sum;
            }, 0);

            bars.duration(1000)
              .attr('y', function (p, n) {
                return chart.scaleY(reduceValues[n]);
              }).attr('height', function (p, n) {
                return height - chart.scaleY(point.values[n]);
              });

            // var yLabels = g.selectAll('.barYLabel');
            // yLabels.attr('y', function (p, n) {
            //   return chart.scaleY(reduceValues[n]) + (height - chart.scaleY(point.values[n]))/2 + 6;
            // });

          });
        }
      }
    });

    this.base.append('svg:line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', height)
      .attr('y2', height+1)
      .attr('stroke', '#cecfd3');
  },

  addStackedBar: function (width, height, x, y, color, value) {
    var bar = this.append('rect')
      .attr('class', ['bar ' + color || 'default'])
      //.attr('class', color || 'default')
      .attr('width', width)
      .attr('height', height)
      //.attr('x', x)
      .attr('y', y);

    // if(height > 30) {
    //   this.append('text').attr('class', 'barLabel barYLabel')
    //     .attr('text-anchor', 'middle')
    //     .attr('x', x)
    //     .attr('y', y + height/2 + 6).text(value);
    // }

      return bar;
  },

  transform: function(data) {
    var max = d3.max(data, function (point) {
      return d3.sum(point.values);
    });

    this.scaleY.domain([0, max]);

    return data;
  }

});