# avplayer
media player




# 编译wasm

docker run -itd -v C:\Users\lvyi\Desktop\opensource\avplayer:/src --name emsdk --privileged=true  emscripten/emsdk




# 编译docker image

docker build -f Dockerfile -t tdcr5/avplayer:0.2.0 .
docker push tdcr5/avplayer:0.2.0



# 运行docker image

docker run --name avplayer -itd -p 9080:80 tdcr5/avplayer:0.2.0
