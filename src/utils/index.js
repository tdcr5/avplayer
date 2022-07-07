
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

//浏览器播放声音时，传递的切片里采样个数要求是2的倍数，根据采样率选择一个合适的采样切片数
function caculateSamplesPerPacket(sampleRate) {

    if (sampleRate >= 44100) {

        return 1024;

    } else if (sampleRate >= 22050) {

        return 512;

    } else {
        return 256;
    }


}




export { uint2int, clamp, caculateSamplesPerPacket };