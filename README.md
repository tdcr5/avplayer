# avplayer
media player




# 编译wasm

  docker run --rm -it -v C:\Users\lvyi\Desktop\opensource\avplayer:/src apiaryio/emcc emcc  wasm/hello.cc -s ALLOW_MEMORY_GROWTH=1  --js-library wasm/pkg.js  -o wasm/hello.js