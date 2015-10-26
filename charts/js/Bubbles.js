d3.chart('BubblesChart', {

  initialize: function  () {
    var _this = this;
    this.dataDepth = 1;

    var svg = this.base.node(),
      width = +svg.getAttribute('width'),
      height = +svg.getAttribute('height');

    var diameter = d3.min([width, height]);

    var pack = d3.layout.pack().size([diameter, diameter])
      .value(function (d) {
        return d.value;
      })
      .children(function (d) {
        if(d.depth == _this.dataDepth) {
          return d.sumedChildren || d._children;
        } else return d._children;
      });
      // .padding(3);

    this.layer('Bubbles', this.base.append('g'), {

      dataBind: function(data) {
        return this.datum(data).selectAll('.bubble')
          .data(pack.nodes, function (node) {
            return node.id;
          });
      },

      insert: function() {
        var chart = this.chart();

        return this.append('g')
          .attr('class', function (d) {
            return 'bubble'//+ (d.depth < 1 ? 'zoomable' : '');
          }).attr('id', function (d) {
            return d.id;
          }).attr('data-zoomId', function (d) {
            return d.depth > 1 || d.id.indexOf('sumed') > 0 ? d.parent.id : d.id;
          }).on('click', function (d) {
            if (d.depth == 0) {
              if(chart.dataDepth == 0 || d.parent) {
                chart.zoom(1, true);
              } else {
                chart.zoom(0, true);
              }

              if(d.parent) {
                chart.draw(d.parent);
              } else {
                chart.draw(d);
              }

            } else {
              if(d.depth == chart.dataDepth){
                if(d._children) {
                  chart.draw(d);
                } else {
                  chart.draw(d.parent.parent);
                }
              } else if(d.depth > chart.dataDepth && d.parent) {
                if(d.parent.depth == 0) {
                  chart.zoom(1, true);
                }

                chart.draw(d.parent);
              }
            }
          }).on('mouseenter', function () {
            var zoomId = d3.select(this).attr('data-zoomId');
            chart.base.select('#'+zoomId).attr('class', 'bubble zoomHover')
          }).on('mouseleave', function () {
            var zoomId = d3.select(this).attr('data-zoomId');
            chart.base.select('#'+zoomId).attr('class', 'bubble')
          });
      },

      // define lifecycle events
      events: {
        enter: function () {
          var chart = this.chart();

          this.attr('transform', function(d) {
            //console.log(d);
            return 'translate('+ d.x + ',' + d.y + ')';
          });

          this.append('circle')
            // .attr('class', function (d) {
            //   return d.depth <= 1 ? 'zoomable' : '';
            // })
            .attr('r', function (d) {
              return 0;
            });
        },

        exit: function () {
          this.remove();
        },

        'merge:transition': function () {
          // this.duration(500).attr('transform', function (d) {
          //   return 'translate('+ d.x + ',' + d.y + ')';
          // });

          this.each(function (d) {
            var g = d3.select(this),
              circles = g.selectAll('circle');

            var rayon = circles.attr('r'),
              posDuration = 500, sizeDuration = 500, 
              posDelay = sizeDuration*(rayon > d.r ? 1 : 0),
              sizeDelay = 200*d.depth*(rayon > d.r ? 0 : 1);

            g.transition().delay(0).duration(posDuration).attr('transform', function (d) {
              return 'translate('+ d.x + ',' + d.y + ')';
            });
            circles.transition().delay(sizeDelay).duration(sizeDuration).attr('r', d.r);
          });
        }
      }

    });

    this.layer('labels', this.base.append('g'), {
      dataBind: function(data) {
        return this.datum(data).selectAll('text')
          .data(pack.nodes, function (node) {
            return node.id;
          });
      },

      insert: function () {
        return this.append('text');
      },

      events: {
        enter: function () {
          this.text(function (d) {
            return d.id + ' - ' + d.value;
          }).attr('x', function (d) {
            return d.x;
          }).attr('y', function (d) {
            return d.y;
          });
        },

        exit: function () {
          this.remove();
        },

        merge: function () {
          this.style('visibility', function (d) {
            return d.depth == 1 ? 'visible' : 'hidden';
          });
        },

        'merge:transition': function () {
          this.duration(500)
            .attr('x', function (d) {
              return d.x;
            }).attr('y', function (d) {
              return d.y;
            })
        }
      }
    });
  },

  transform: function (data) {
    return data;
  },

  zoom: function (z, reset) {
    if(reset) {
      this.dataDepth = z;
    } else {
      this.dataDepth += z;
    }

    return this;
  }

});