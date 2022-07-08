# avplayer
    avplayer 是一个流媒体播放器，支持http-flv格式流，实现了自定义的渲染方式renderMode

    normal: 正常渲染
    green: 图像如果带绿幕，绿幕部分抠图成透明
    mask：图像右半部分带掩码图，则左半部显示并抠图成透明
    cube: 渲染立方体显示




# 编译解码wasm 
    本工程解码部分使用 wasm技术，通过emcc容器将ffmpeg和解码code编译成wasm，供js调用

    (1) 启动emcc容器,把工程路径映射进容器里（windows/mac 先安装 Docker Desktop， linux上先安装 docker）
        docker run -itd -v "avplayer project path":/src --name emsdk --privileged=true  emscripten/emsdk

        编译wasm需要进入emcc容器里
        docker exec -it emsdk /bin/bash

    (2) 编译FFmpeg wasm库（工程里已经编译好了）
        
        先进入容器
        cd FFmpeg
        python3 ffmpeg.py

    (3) 编译decoder wasm库 （工程里已经编译好了）   

        先进入容器
        cd wasm
        python3 make.py

# 工程打包
   
    npm config set registry https://registry.npm.taobao.org
    npm install
    npx cross-env NODE_ENV=development rollup -c 

# 运行Demo

    demo/public 目录下，使用 Live Server (VSCode的用于调试html的插件) 打开 demo.html


# 编译docker image

    基于nginx镜像构建

    docker build -f Dockerfile -t tdcr5/avplayer:0.4.0 .
    docker push tdcr5/avplayer:0.4.0



# 运行docker image

docker run --name avplayer -itd -p 9080:80 tdcr5/avplayer:0.4.0
