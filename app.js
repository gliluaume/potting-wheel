(function(window){
  prms = {
    angularSpeed: 0.02,//Math.PI / 10;,
    point: {
      color: '#ff0000',
      lineWidth: 1,
      radius: 1,
      xOffset: 0, // pour créer une irrégularité : tourne pas complètement rond
      yOffset: 0
    },
    dimensions: {
      squareSize: 600,
      scaleFactor: 1,
      circleFactor: 0.4,
      circleColor: '#325FA2'
    }
  };
  var lastSeq = 0;
  var currentAngle = 0;
  var points = [];
  var pointing = null; // if mouse down

  function draw() {
    var ctx = document.getElementById('canvas').getContext('2d');
    currentAngle = (currentAngle + prms.angularSpeed) % (2 * Math.PI);
    ctx.save();
    ctx.clearRect(0, 0, prms.dimensions.squareSize, prms.dimensions.squareSize);
    ctx.translate(prms.dimensions.squareSize/2, prms.dimensions.squareSize/2);
    ctx.scale(prms.dimensions.scaleFactor, prms.dimensions.scaleFactor);
    ctx.strokeStyle = prms.dimensions.circleColor;
    ctx.lineWidth = 4;
    ctx.rotate(currentAngle);

    // a mark
    ctx.beginPath();
    ctx.moveTo(prms.dimensions.squareSize * prms.dimensions.circleFactor + 15, 0);
    ctx.lineTo(prms.dimensions.squareSize * prms.dimensions.circleFactor, 0);
    ctx.stroke();

    // draw circle
    ctx.beginPath();
    ctx.strokeStyle = prms.dimensions.circleColor;
    ctx.arc(0, 0, prms.dimensions.squareSize * prms.dimensions.circleFactor, 0, Math.PI * 2, true);
    ctx.stroke();

    // add pointing mouse down
    if(pointing) addPoint(pointing);

    // draw points
    points.forEach((point) => drawCircle(ctx, point));

    ctx.restore();
    window.requestAnimationFrame(draw)
  }

  function clear() {
    points = [];
  }

  function save() {
    var canvas = document.getElementById('canvas');
    var imageDl = document.getElementById('canvasImgDl');
    imageDl.href = canvas.toDataURL();
    document.getElementById('canvasImgDl').click()
  }

  function deleteLastSeq() {
    points = points.filter(p => p.seq < lastSeq);
    lastSeq = getLastSeq();
  }
  function getLastSeq() {
    return points.length ? Math.max.apply(null, points.map(item => item.seq)) : 0;
  }

  function drawCircle(ctx, point) {
    ctx.beginPath();
    ctx.lineWidth = point.lineWidth;
    ctx.strokeStyle = point.color;
    ctx.fillStyle = point.color;
    ctx.arc(point.x + prms.point.xOffset, point.y + prms.point.yOffset, point.radius, 0, Math.PI * 2, true);
    ctx.stroke();
  }

  function addPoint(event) {
    var p = correctPosition({ x: event.layerX, y: event.layerY });
    if(isInCircle(p))
      points.push(Object.assign({}, prms.point, p, { seq: lastSeq }));
  }
  function isInCircle(p) {
    return (Math.pow(p.x, 2) + Math.pow(p.y, 2) <  Math.pow(prms.dimensions.squareSize * prms.dimensions.circleFactor, 2));
  }

  function correctPosition(p) {
    var alpha = -currentAngle;
    return  rotatePoint({
      x: p.x * 1/prms.dimensions.scaleFactor - prms.dimensions.squareSize/2 * 1/prms.dimensions.scaleFactor,
      y: p.y * 1/prms.dimensions.scaleFactor - prms.dimensions.squareSize/2 * 1/prms.dimensions.scaleFactor,
    });
  }

  function rotatePoint(p, alpha) {
    var alpha = alpha || -currentAngle;
    return {
      x: p.x * Math.cos(alpha) - p.y * Math.sin(alpha),
      y: p.x * Math.sin(alpha) + p.y * Math.cos(alpha)
    }
  }

  var canvasElt = document.getElementById('canvas');
  canvasElt.setAttribute('width', prms.dimensions.squareSize);
  canvasElt.setAttribute('height', prms.dimensions.squareSize);
  canvasElt.addEventListener('click', addPoint, false);
  canvasElt.addEventListener('mousedown', (event) => { lastSeq++; pointing = event; }, false);
  canvasElt.addEventListener('mousemove', (event) => { if(pointing) pointing = event }, false);
  canvasElt.addEventListener('mouseup', (event) => pointing = null, false);

  // on fait une interface avec l'extérieur
  window.requestAnimationFrame(draw);
  window.pottingWheelPrms = prms;
  window.pottingWheelPrms.clear = clear;
  window.pottingWheelPrms.undo = deleteLastSeq;
  window.pottingWheelPrms.save = save;
})(window);

(function(window){
  if(window.pottingWheelPrms) {

    document.getElementById('angular-speed').value = Math.round(window.pottingWheelPrms.angularSpeed * 100);
    document.getElementById('color').value = window.pottingWheelPrms.point.color;
    document.getElementById('lineWidth').value = window.pottingWheelPrms.point.lineWidth;
    document.getElementById('radius').value = window.pottingWheelPrms.point.radius;

    document.getElementById('angular-speed')
    .addEventListener('change', (event) => {
       window.pottingWheelPrms.angularSpeed = event.target.value / 100;
    });
    mapPointOption('color', 'color');
    mapPointOption('radius', 'radius');
    mapPointOption('lineWidth', 'lineWidth');

    mapAction('clear', 'clear');
    mapAction('undo', 'undo');
    mapAction('save', 'save');

    function mapAction(idHtml, actionName) {
      document.getElementById(idHtml)
      .addEventListener('click', (event) => {
         window.pottingWheelPrms[actionName]();
      });
    }

    function mapPointOption(idHtml, optionName) {
      document.getElementById(idHtml)
      .addEventListener('change', (event) => {
         window.pottingWheelPrms.point[optionName] = event.target.value;
      });
    }
  }
})(window);