
function uint2int (num) {
    if (num > 0xff / 2) {
      var a = ~0xff;
      num = num | a;
    }
    return num;
  }

function clamp(num, a, b) {
    return Math.max(Math.min(num, Math.max(a, b)), Math.min(a, b));
}


export { uint2int, clamp };