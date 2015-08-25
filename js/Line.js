d3.chart('LineChart', {

  initialize: function () {
    var _this = this;

    var svg = this.base.node(),
      width = +svg.getAttribute('width'),
      height = +svg.getAttribute('height');

    this.x = d3.scale.linear()
      .range([0, width]);

    this.y = d3.scale.linear()
      .range([height, 0]);

    var xAxis = d3.svg.axis()
      .scale(this.x)
      .orient('bottom');

    var yAxis = d3.svg.axis()
      .scale(this.y)
      .orient('left')

    var svgLine = d3.svg.line()
        .x(function (d) {
          return _this.x(d.x);
        })
        .y(function (d) {
          return _this.y(d.y);
        });

    this.layer('Lines', this.base.append('g'), {

      dataBind: function (data) {
        return this.selectAll('.line')
          .data(data, function (line) {
            return line.id;
          });
      },

      insert: function (data) {
        return this.append('path')
          .attr('class', 'line');
      },

      // define lifecycle events
      events: {
        enter: function () {
          this.attr('d', function (line) {
            // console.log(line);
            return svgLine(line.points);
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
    function linesExtent (lines, pointAttr) {
      var max = d3.max(lines, function (line) {
        return d3.max(line.points, function (point) {
          return point[pointAttr];
        });
      });

      var min = d3.min(data, function (line) {
        return d3.min(line.points, function (point) {
          return point[pointAttr];
        });
      });

      return [min, max];
    }

    this.x.domain(linesExtent(data, 'x'));
    this.y.domain(linesExtent(data, 'y'));

    return data;
  }

});