export default function randomChar() {
  var l = 8;
  var c = "abcdefghijklmnopqrstuvwxyz0123456789";
  var cl = c.length;
  var randomChar = "";
  for (var i = 0; i < l; i++) {
    randomChar += c[Math.floor(Math.random() * cl)];
  }
  return randomChar;
}
