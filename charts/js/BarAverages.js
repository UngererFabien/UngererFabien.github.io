d3.chart('BarAveragesChart', {

  initialize: function () {
    var _this = this;

    var margin = {bottom: 20, top: 30, left: 20, right: 50};

    var svg = this.base.node();
    this.width = +svg.getAttribute('width');
    this.height = +svg.getAttribute('height');

    this.scaleX = d3.scale.ordinal()
      .rangeBands([0, this.width - margin.left - margin.right], 0.33, 0.33);

    this.scaleY = d3.scale.linear()
      .range([this.height - margin.bottom, margin.top]);

    var color = d3.scale.category20();

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
          .data(data.points, function (point, i) {
            return point.id;
          });
      },

      insert: function () {
        var g = this.append('g')
          .attr('class', 'bar');

        g.append('rect');
        g.append('text');

        return g;
      },

      // define lifecycle events
      events: {

        enter: function () {
          var chart = this.chart();

          function x (point, i) {
              return chart.scaleX(point.label) //+ chart.scaleX.rangeBand()*2;
          }

          this.select('rect').attr('x', x).attr('width', chart.barWidth)
            .attr('y', function (point) {
              return chart.height - margin.bottom - margin.top - 1; // For animation
              // return chart.scaleY(point.value) + 1;
            }).attr('height', function (point) {
              return 1 // For animation
              // return chart.height - margin.bottom - margin.top - chart.scaleY(point.value);
            });

          this.select('text').attr('text-anchor', 'middle')
            .attr('x', function x (point, i) {
              return chart.scaleX(point.label) + chart.scaleX.rangeBand()/2;
            }).attr('y', function (point) {
              return chart.height - margin.bottom - margin.top - 7; // For animation
            })

        },

        // 'exit:transition': function () {
        //   // console.log('exit', this);

        //   var chart = this.chart();

        //   this.duration(1000)
        //     .attr('x', function (point, i) {
        //       return -chart.scaleX.rangeBand()*2;
        //     }).remove();
        // },

        merge: function () {
          this.select('rect').style('fill', function (d) {
            return color(d.cat);
          })
        },

        'merge:transition': function () {
          // console.log('merge:transition');

          var chart = this.chart();

          // Keep this animation for Y rescaling
          this.select('rect').duration(1000)
            .attr('x', function (point, i) {
              return chart.scaleX(point.label)
            }).attr('width', chart.scaleX.rangeBand())
            .attr('y', function (point) {
              return chart.scaleY(point.value) + 1;
            }).attr('height', function (point) {
              return chart.height - margin.bottom - margin.top - chart.scaleY(point.value);
            });

          this.select('text').duration(1000)
            .attr('y', function (point) {
              return chart.scaleY(point.value) - 7;
            }).tween('text', function (point) {
              var currVal = +this.textContent;
              var inter = d3.interpolate(currVal, point.value);
              return function (t) {
                this.textContent = Math.round(inter(t)*100)/100;
              }
            })
        }
      }
    });

    this.layer('Averages', this.base.append('g'), {
      dataBind: function (data) {
        return this.selectAll('.average')
          .data(data.averages, function (d) {
            return d.key;
          });
      },

      insert: function () {
        var g = this.append('g')
          .attr('class', 'average');

        g.append('line');
        g.append('text');

        return g
      },

      events: {
        enter: function () {
          var chart = this.chart();

          var y = chart.height - margin.bottom - margin.top;

          this.select('line').attr('x1', 0)
            .attr('x2', chart.width - margin.right - margin.left)
            .attr('y1', y).attr('y2', y);

          this.select('text').attr('text-anchor', 'left')
            .attr('x', chart.width - margin.right - margin.left + 5)
            .attr('y', function (point) {
              return chart.height - margin.bottom - margin.top + 5; // For animation
            })
        },

        merge: function () {
          this.select('line').style('stroke', function (avg) {
            return color(avg.key);
          });
        },

        'merge:transition': function () {
          var chart = this.chart();

          function y (avg) {
            return chart.scaleY(avg.val);
          } 

          this.select('line').duration(1000)
            .attr('y1', y).attr('y2', y);

          this.select('text').duration(1000)
            .attr('y', function (avg) {
              return chart.scaleY(avg.val) + 5;
            }).tween('text', function (avg) {
              var currVal = +this.textContent;
              var inter = d3.interpolate(currVal, avg.val);
              return function (t) {
                this.textContent = Math.round(inter(t)*100)/100;
              }
            })
        }
      }
    });

    this.svgXAxis = this.base.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(' + (0) + ',' + (this.height-margin.bottom - margin.top) + ')');

  },

  transform: function (data) {
    var max = d3.max(data, function (point) {
      return point.value;
    });

    var cats = d3.nest().key(function (d) {
      return d.cat
    }).entries(data);

    var averages = [];

    for (var i = cats.length - 1; i >= 0; i--) {
      var cat = cats[i];
      averages.push({
        key: cat.key,
        val: d3.sum(cat.values, function (d) {return d.value})/cat.values.length
      });
    };

    this.scaleX.domain(data.map(function (d) {return d.label}));
    this.scaleY.domain([0, max]);

    this.xAxis.tickValues(data.map(function (d) {return d.label}));
    this.svgXAxis.call(this.xAxis)
      .selectAll('text')
        // .attr('y', 7)
        // .attr('x', -3)
        // .attr('transform', 'rotate(30)')
        // .style('text-anchor', 'start');

    console.log(data, averages);

    return {
      points: data,
      averages: averages
    };
  }

});