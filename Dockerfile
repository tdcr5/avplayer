# Build
FROM node:16.15.1 as builder
WORKDIR /go/src/github.com/tdcr5/avplayer
COPY . .
RUN npm config set registry https://registry.npm.taobao.org
RUN npm install
RUN npx cross-env NODE_ENV=development rollup -c 



FROM nginx:1.23.0

COPY --from=builder /go/src/github.com/tdcr5/avplayer/demo/public /usr/share/nginx/html

EXPOSE 80

