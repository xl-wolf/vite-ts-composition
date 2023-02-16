var canvas = document.createElement("canvas");
var context = canvas.getContext("2d");
var W = window.innerWidth;
var H = window.innerHeight;
canvas.width = W;
canvas.height = H;
var fontSize = 18;
var colunms = Math.floor(W / fontSize);
var coordinate = [];
for (var i = 0; i < colunms; i++) {
  coordinate.push(0);
}
var str = "javascript canvas python svg";
function draw() {
  console.log('canvas12')
  context.fillStyle = "rgba(0,0,0,0.05)";
  context.fillRect(0, 0, W, H);
  context.font = "800 " + fontSize + "px  宋体";
  context.fillStyle = "#01fef5";//"rgba(0,255,255,0.4)"//randColor()
  for (var i = 0; i < colunms; i++) {
    var index = Math.floor(Math.random() * str.length);
    var x = i * fontSize;
    var y = coordinate[i] * fontSize;
    context.fillText(str[index], x, y);
    if (y >= canvas.height && Math.random() > 0.88) {
      coordinate[i] = 0;
    }
    coordinate[i]++;
  }
}
function randColor() {
  var r = Math.floor(Math.random() * 256);
  var g = Math.floor(Math.random() * 256);
  var b = Math.floor(Math.random() * 256);
  return "rgb(" + r + "," + g + "," + b + ")";
}

let intervalId = null
export const drawCanvas = (domId) => {
  const dom = document.getElementById(domId)
  draw();
  intervalId = setInterval(draw, 30);
  dom.appendChild(canvas)
}
export const clearFunc = () => {
  intervalId && clearInterval(intervalId)
  console.log("intervalId", intervalId)
}