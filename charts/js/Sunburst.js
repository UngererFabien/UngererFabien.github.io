d3.chart('SunburstChart', {

  initialize: function () {

    var svg = this.base.node(),
      width = +svg.getAttribute('width'),
      height = +svg.getAttribute('height');

    var color = d3.scale.category20c();

    var partition = d3.layout.partition()
      .size([2*Math.PI, (height/2)-20])
      .value(function (point) {
        return point.value;
      }).sort(function (a, b) {
        return b.depth - a.depth;
      });

    // Start position of arcs
    var enterArc = d3.svg.arc()
      .startAngle(function (point) {return point.x})
      .endAngle(function (point) {return point.x + point.dx})
      .innerRadius(function (point) {return point.y})
      .outerRadius(function (point) {return point.y});

    var arc = d3.svg.arc()
      .startAngle(function (point) {return point.x})
      .endAngle(function (point) {return point.x + point.dx})
      .innerRadius(function (point) {return point.y})
      .outerRadius(function (point) {return point.y + point.dy});

    var arcsBase = this.base.append('g')
      .attr('transform', 'translate(' + width/2 + ',' + height/2 + ')');

    this.layer('Arcs', arcsBase, {
      dataBind: function (data) {
        return this.data([data]).selectAll('path')
          .data(partition.nodes, function (node) {
            return node.id;
          });
      },

      insert: function () {
        var g = this.append('g');

        g.append('path');
        g.append('text');

        return g
      },

      events: {
        enter: function () {
          var chart = this.chart();

          this.select('path').attr('d', enterArc).style('fill', function (point) {
              return color((point.children ? point : point.parent).id);
          });

          this.select('text').attr('x', function (d) {
            // console.log(d.x, d.y);
            return (d.x+d.dx)/2;
          }).attr('y', function (d) {
            return (d.y+d.dy)/2;
          });
        },

        'first:merge:transition': function () {
          var chart = this.chart();

          // var totalDelay = 0;

          this.select('path').duration(function (d) {
            //if(!d.depth) chart.totalVal = d.value;
            return 700 //(d.value/chart.totalVal)*10000;
          }).delay(function (d, i) {
            // var delay = totalDelay;
            // if(d.depth) totalDelay += (d.value/chart.totalVal)*10000;

            // return delay;
            return d.depth*400
          }).attr('d', function (d) {
            if(d.depth > 0) {
              return arc(d);
            } else this.remove();
          });

          this.select('text').duration(1000)
            .tween('text', function (point) {
              var currVal = +this.textContent;
              var inter = d3.interpolate(currVal, point.value);
              return function (t) {
                this.textContent = Math.round(inter(t)*100)/100;
              }
            });
        },

        'merge:transition': function () {
          this.select('path').duration(700).attr('d', function (d) {
            if(d.depth > 0) {
              return arc(d);
            } else this.remove();
          });

          this.select('text').duration(1000)
            .tween('text', function (point) {
              var currVal = +this.textContent;
              var inter = d3.interpolate(currVal, point.value);
              return function (t) {
                this.textContent = Math.round(inter(t)*100)/100;
              }
            });
        }
      }
    });

  },

  transform: function (data) {
    return data;
  }

});