var canvas = document.createElement('canvas');
var context = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
requestAnimationFrame = requestAnimationFrame || webkitRequestAnimationFrame;

var OPTIONS = {
  AMOUNT: 120,
  UPPER_LIMIT: 20,
  LOWER_LIMIT: 1
};
var UPPER_SIZE = 10;
var LOWER_SIZE = 4;
var doIt = function doIt() {
  return Math.random() > 0.5;
};
var update = function update(p) {
  return doIt() ? Math.max(OPTIONS.LOWER_LIMIT, p - 1) : Math.min(p + 1, OPTIONS.UPPER_LIMIT);
};
var reset = function reset(p) { p.x = p.startX; p.y = p.startY; };
var floored = function floored(r) { return Math.floor(Math.random() * r); };
var genParticles = function genParticles() {
  return new Array(OPTIONS.AMOUNT).fill().map(function (p) {
    var size = floored(UPPER_SIZE) + LOWER_SIZE; var c = document.createElement('canvas'); var ctx = c.getContext('2d'); var r = Math.PI / 180 * floored(360); var color = 'rgba(0,' + (100 + Math.floor(Math.random() * 70)) + ', 255, ' + Math.random() + ')'; var xDelayed = doIt(); var startX = xDelayed ? -(size + floored(canvas.width)) : floored(canvas.width * 0.25); var startY = xDelayed ? size + floored(canvas.height * 0.25) + Math.floor(canvas.height * 0.75) : canvas.height + size + floored(canvas.height); c.height = size; c.width = size; context.globalCompositeOperation = 'multiply'; ctx.translate(size / 2, size / 2); ctx.rotate(r); ctx.translate(-(size / 2), -(size / 2)); ctx.fillStyle = color; ctx.fillRect(0, 0, size, size); return {
      x: startX, y: startY, startY: startY, startX: startX, c: c, r: r, vx: floored(OPTIONS.UPPER_LIMIT / 4), vy: floored(OPTIONS.UPPER_LIMIT / 4), size: size
    };
  });
};
var particles = genParticles();
var FRAME_COUNT = 0;
let animationFrameId = null
var draw = function draw() {
  console.log('canvas13')
  if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particles = genParticles();
  }
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;
  try {
    for (var _iterator = particles[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) { var particle = _step.value; context.clearRect(particle.x, particle.y, particle.size, particle.size); FRAME_COUNT++; if (particle.y < canvas.height || particle.startX < 0) particle.x += particle.vx; if (particle.x > 0 || particle.startY > canvas.height) particle.y -= particle.vy; if (FRAME_COUNT % 11 === 0 && doIt()) particle.vx = update(particle.vx); if (FRAME_COUNT % 13 === 0 && doIt()) particle.vy = update(particle.vy); context.drawImage(particle.c, particle.x, particle.y); if (particle.x > canvas.width || particle.y < -particle.size) reset(particle); }
  } catch (err) {
    _didIteratorError = true; _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) { _iterator.return(); }
    } finally {
      if (_didIteratorError) { throw _iteratorError; }
    }
  }
  animationFrameId = requestAnimationFrame(draw);
}

export const drawCanvas = (domId) => {
  const dom = document.getElementById(domId)
  draw();
  dom.appendChild(canvas)
}
export const clearFunc = () => {
  animationFrameId && cancelAnimationFrame(animationFrameId)
  console.log("animationFrameId", animationFrameId)
}