// {
// "name": "wake up",
// "description": "turn lights on in guest room at 7:55 am",
// "command": {
//   "address":
//   "/api/HcN4ZJ0p9PLlteU5IJ9kFOEhnXYcP9lQ8A1nVrEH/groups/4/action",
//   "method": "PUT",
//   "body": {
//     "on": true
//   }
// },
// "localtime": "2018-08-06T07:55:00",
// "status": "enabled",
// "autodelete": false
// }
const baseUrl = 'http:/192.168.86.86';
const username = 'HcN4ZJ0p9PLlteU5IJ9kFOEhnXYcP9lQ8A1nVrEH';
var rooms = {guestRoom: 4, livingRoom: 1};
const actionStr = '/action';
var currRoom = 'guestRoom';

function onLoad() {
  $('#guestBrightnessText').text($('#guestBrightnessSlider').val() + '%');
  runQuery({}, buildURL(''), 'GET');
}

function toggle(turnOn) {
  let jsonBody = {on: turnOn}
  runQuery(jsonBody, buildURL());
}

function changeColor() {
//var color = '#b2ffb6';
  var color = $('#colorpicker').val();
  if(color === '#000000') return;
  //console.log(color, currRoom, getHue(color));
  let jsonBody = {xy: getHue(color)};
  let xy = jsonBody.xy;
  console.log(xy);
  console.log(getHex(xy[0], xy[1], 125));
  console.log(color);
  runQuery(jsonBody, buildURL());
}

function changeBrightness(percent) {
  let val = Math.round(percent * 2.54);
  let jsonBody = {bri: val};
  console.log(percent, val);
  runQuery(jsonBody, buildURL());
}

function buildURL(action = actionStr) {
  console.log(action);
  var url = baseUrl + '/api/' + username
  + '/groups/' + rooms[currRoom] + action;
  return url;
}

function changeRoom() {
  currRoom = ($('#roomSelect').val());
  runQuery({}, buildURL(''), 'GET');
}

function runQuery(json, url, type = 'PUT', func) {
  console.log(json, url);
  if(type === 'PUT') {
    $.ajax({
      type: 'PUT',
      url: url,
      data: JSON.stringify(json)
    }).done(function( msg ) {
      console.log(JSON.stringify(msg))
      if(msg[0].success) {
        console.log('Success!');
      }
      else {
        console.log('Failed!');
      }
    });
  } else {
    $.ajax({
      type: 'GET',
      url: url
    }).done(loadInfo);
  }
}

function loadInfo(msg) {
  console.log(JSON.stringify(msg));
  console.log(msg.name);
  let bri = msg.action.bri;
  let xy = msg.action.xy;
  console.log(getHex(xy[0], xy[1], bri));
  $('#guestToggle').prop('checked', msg.action.on);
  $('#guestBrightnessSlider').val(parseInt(msg.action.bri) / 2.54);
  $('#guestBrightnessText').text(Math.round(parseInt(msg.action.bri) / 2.54) + '%');
}

function getHue(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  var r = parseInt(result[1], 16) / 255;
  var g = parseInt(result[2], 16) / 255;
  var b = parseInt(result[3], 16) / 255;

  var X = (r * 0.649926 + g * 0.103455 + b * 0.197109);
  var Y = (r * 0.234327 + g * 0.743075 + b * 0.022598);
  var Z = (r * 0.0000000 + g * 0.053077 + b * 1.035763);

  var x = X / (X + Y + Z);
  var y = Y / (X + Y + Z);

  return [x, y];
}

function getHex(x, y, bri){
  z = 1.0 - x - y;
  Y = bri / 255.0;
  X = (Y / y) * x;
  Z = (Y / y) * z;

  r = X * 1.612 - Y * 0.203 - Z * 0.302;
  g = -X * 0.509 + Y * 1.412 + Z * 0.066;
  b = X * 0.026 - Y * 0.072 + Z * 0.962;
  r = r <= 0.0031308 ? 12.92 * r : (1.0 + 0.055) * Math.pow(r, (1.0 / 2.4)) - 0.055;
  g = g <= 0.0031308 ? 12.92 * g : (1.0 + 0.055) * Math.pow(g, (1.0 / 2.4)) - 0.055;
  b = b <= 0.0031308 ? 12.92 * b : (1.0 + 0.055) * Math.pow(b, (1.0 / 2.4)) - 0.055;
  maxValue = Math.max(r,g,b);

  r /= maxValue;
  g /= maxValue;
  b /= maxValue;

  r = r * 255;   if (r < 0) { r = 255 };
  g = g * 255;   if (g < 0) { g = 255 };
  b = b * 255;   if (b < 0) { b = 255 };

  // return {
  //   r :r,
  //   g :g,
  //   b :b
  // };
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
