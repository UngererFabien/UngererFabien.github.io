d3.chart('WorldMapChart', {

  initialize: function () {
    var _this = this;

    var canvas = this.base.append('canvas')
      .attr('width', 700)
      .attr('height', 500);

    var canvasNode = canvas.node(),
      width = +canvasNode.getAttribute('width'),
      height = +canvasNode.getAttribute('height');

    var context = canvasNode.getContext('2d');
    context.lineWidth = 0.5;
    context.lineJoin = 'round';
    context.lineCap = 'round';

    var initTranslate = [0, -100];

    // map generation commande : 
    // topojson -q 1e5 --projection='width = 1080, height = 720, d3.geo.equirectangular().translate([width/2, height/2]).scale((width) / 2 / Math.PI)' countries=ne_50m_admin_0_countries.shp -o world.json
    
    // map.json values
    var mapWidth = 1080,
      mapHeight = 720;

    // var translate, scale, area; // variables for zoom
    var scale, area;

    var clip = d3.geo.clipExtent();

    var zoom = d3.behavior.zoom()
      .translate(initTranslate)
      .scale(1)
      .scaleExtent([1, 8]);

      // .center([mapWidth/2, mapHeight/2])

    function createMapPath (land, boundary, scaleTranslate) {
      var translate;

      var simplify = d3.geo.transform({
        point: function (x, y, z) {
          if(z >= area) {
            this.stream.point(x * scale + translate[0], y * scale + translate[1]);
          }
        }
      });

      var path = d3.geo.path()
        .projection({
          stream: function (s) {
            return simplify.stream(clip.stream(s));
          }
        })
        .context(context);

      return function (translatePos) {
          translate = translatePos;

          // console.log(translate[0]*scale);

          context.beginPath();
          path(land);
          context.fillStyle = '#cecfd3';
          context.fill();

          context.beginPath();
          path(boundary);
          context.strokeStyle = '#fff';
          context.stroke();
      }
    }

    d3.json('/charts/json/world.json', function (err, world) {
      if(err) throw err;

      topojson.presimplify(world);

      var land = topojson.feature(world, world.objects.countries);
      var boundary = topojson.mesh(world, world.objects.countries, function(a, b) {
        return a !== b;
      });

      var maps = [createMapPath(land, boundary, 1), createMapPath(land, boundary, 2)];

      function renderWorld () {
        var zoomTranslate = zoom.translate();
        scale = zoom.scale();
        area = 1/scale/scale;

        if(zoomTranslate[0] > mapWidth*scale) {
          zoom.translate([zoomTranslate[0]-mapWidth, zoomTranslate[1]]);
        } else if (zoomTranslate[0] < -mapWidth*scale) {
          zoom.translate([zoomTranslate[0]+mapWidth, zoomTranslate[1]]);
        }

        zoomTranslate = zoom.translate();

        context.clearRect(0, 0, width, height);

        context.save();

        maps[0](zoomTranslate);

        if(zoomTranslate[0] > 0) {
          maps[1]([(zoomTranslate[0]-mapWidth*scale), zoomTranslate[1]]);
        } else {
          maps[1]([(zoomTranslate[0]+mapWidth*scale), zoomTranslate[1]]);
        }

        context.restore();
      }

      canvas.call(zoom.on('zoom', renderWorld));

      renderWorld();

    });

    // this.layer('world', this.base.append('g'), {

    //   dataBind: function (data) {
        
    //   },

    //   insert: function () {
        
    //   },

    //   events: {
        
    //   }
    // });
  },

  transform: function (data) {

    return data;
  }

});