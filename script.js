"use strict";

var STAR_COLOR = '#fff';
var STAR_SIZE = 3;
var STAR_MIN_SCALE = 0.2;
var OVERFLOW_THRESHOLD = 50;
var STAR_COUNT = (window.innerWidth + window.innerHeight) / 8;
var canvas = document.querySelector('canvas'),
  context = canvas.getContext('2d');
var scale = 1,
  // device pixel ratio
  width,
  height;
var stars = [];
var pointerX, pointerY;
var velocity = {
  x: 0,
  y: 0,
  tx: 0,
  ty: 0,
  z: 0.0005
};
var touchInput = false;
generate();
resize();
step();
window.onresize = resize;
function generate() {
  for (var i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: 0,
      y: 0,
      z: STAR_MIN_SCALE + Math.random() * (1 - STAR_MIN_SCALE)
    });
  }
}
function placeStar(star) {
  star.x = Math.random() * width;
  star.y = Math.random() * height;
}
function recycleStar(star) {
  var direction = 'z';
  var vx = Math.abs(velocity.x),
    vy = Math.abs(velocity.y);
  if (vx > 1 || vy > 1) {
    var axis;
    if (vx > vy) {
      axis = Math.random() < vx / (vx + vy) ? 'h' : 'v';
    } else {
      axis = Math.random() < vy / (vx + vy) ? 'v' : 'h';
    }
    if (axis === 'h') {
      direction = velocity.x > 0 ? 'l' : 'r';
    } else {
      direction = velocity.y > 0 ? 't' : 'b';
    }
  }
  star.z = STAR_MIN_SCALE + Math.random() * (1 - STAR_MIN_SCALE);
  if (direction === 'z') {
    star.z = 0.1;
    star.x = Math.random() * width;
    star.y = Math.random() * height;
  } else if (direction === 'l') {
    star.x = -OVERFLOW_THRESHOLD;
    star.y = height * Math.random();
  } else if (direction === 'r') {
    star.x = width + OVERFLOW_THRESHOLD;
    star.y = height * Math.random();
  } else if (direction === 't') {
    star.x = width * Math.random();
    star.y = -OVERFLOW_THRESHOLD;
  } else if (direction === 'b') {
    star.x = width * Math.random();
    star.y = height + OVERFLOW_THRESHOLD;
  }
}
function resize() {
  scale = window.devicePixelRatio || 1;
  width = window.innerWidth * scale;
  height = window.innerHeight * scale;
  canvas.width = width;
  canvas.height = height;
  stars.forEach(placeStar);
}
function step() {
  context.clearRect(0, 0, width, height);
  update();
  render();
  requestAnimationFrame(step);
}
function update() {
  velocity.tx *= 0.96;
  velocity.ty *= 0.96;
  velocity.x += (velocity.tx - velocity.x) * 0.8;
  velocity.y += (velocity.ty - velocity.y) * 0.8;
  stars.forEach(function (star) {
    star.x += velocity.x * star.z;
    star.y += velocity.y * star.z;
    star.x += (star.x - width / 2) * velocity.z * star.z;
    star.y += (star.y - height / 2) * velocity.z * star.z;
    star.z += velocity.z;

    // recycle when out of bounds
    if (star.x < -OVERFLOW_THRESHOLD || star.x > width + OVERFLOW_THRESHOLD || star.y < -OVERFLOW_THRESHOLD || star.y > height + OVERFLOW_THRESHOLD) {
      recycleStar(star);
    }
  });
}
function render() {
  stars.forEach(function (star) {
    context.beginPath();
    context.lineCap = 'round';
    context.lineWidth = STAR_SIZE * star.z * scale;
    context.globalAlpha = 0.5 + 0.5 * Math.random();
    context.strokeStyle = STAR_COLOR;
    context.beginPath();
    context.moveTo(star.x, star.y);
    var tailX = velocity.x * 2,
      tailY = velocity.y * 2;

    // stroke() wont work on an invisible line
    if (Math.abs(tailX) < 0.1) tailX = 0.5;
    if (Math.abs(tailY) < 0.1) tailY = 0.5;
    context.lineTo(star.x + tailX, star.y + tailY);
    context.stroke();
  });
}
