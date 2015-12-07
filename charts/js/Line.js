d3.chart('LineChart', {

  initialize: function () {
    var _this = this;

    var margin = {bottom: 50, left: 30, top: 5, right: 20};

    var svg = this.base.node(),
      width = +svg.getAttribute('width'),
      height = +svg.getAttribute('height');

    this.x = d3.scale.ordinal()
      // .range([0, width-margin.left-margin.right]);
      .rangeRoundPoints([0, width-margin.left-margin.right]);

    this.y = d3.scale.linear()
      .range([height-margin.bottom-margin.top-1, 0]);

    var color = d3.scale.category20();

    this.xAxis = d3.svg.axis()
      .scale(this.x)
      .orient('bottom');

    this.yAxis = d3.svg.axis()
      .scale(this.y)
      .orient('left')

    var svgLine = d3.svg.line()
        .x(function (d) {
          return _this.x(d.x);
        })
        .y(function (d) {
          return _this.y(d.y);
        })
        .interpolate('step');

    var linesElement = this.base.append('g')
      .attr('transform', 'translate(' + (margin.left || 0) + ',' + (margin.top || 0) + ')');

    this.layer('Lines', linesElement, {

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
          this.attr('width', 0);
        },

        merge: function () {
          this.each(function (line) {
            line.previousLength = this.getTotalLength();
          });

          this.attr('d', function (line) {
            return svgLine(line.points);
          }).style('stroke', function (line) {
            return color(line.id);
          });
        },

        'merge:transition': function () {
          this.duration(3000).attrTween('stroke-dasharray', function (line) {
            var l = this.getTotalLength(),
              i = d3.interpolateString(line.previousLength +',' + l, l + ',' + l);
            return function(t) {return i(t)};
          });
        }
      }
    });

    this.svgXAxis = this.base.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(' + (margin.left || 0) + ',' + (height-margin.bottom-1) + ')')
      //.call(this.xAxis);

    this.svgYAxis = this.base.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(' + (margin.left || 0) + ',' + (margin.top || 0) + ' )')
      //.call(this.yAxis);

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

    function xDomains (lines) {
      var domains = [];
      for (var i = lines.length - 1; i >= 0; i--) {
        line = lines[i];

        line.points.forEach(function (patch) {
          if(domains.indexOf(patch.x) < 0) domains.push(patch.x);
        });
      };

      return domains;
    }

    // console.log(linesExtent(data, 'y'));

    this.x.domain(xDomains(data));
    this.y.domain(linesExtent(data, 'y'));

    this.svgXAxis.call(this.xAxis);
    this.svgYAxis.call(this.yAxis);

    return data;
  }

});