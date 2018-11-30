## STAGE 1: Build Angular application ##
FROM node:10-alpine as builder

COPY . /workspace

WORKDIR /workspace

RUN npm install
RUN npm rebuild node-sass
RUN npm run config -- --environment=prod
RUN $(npm bin)/ng build --prod

## STAGE 2: Run nginx to serve application ##
FROM nginx

COPY --from=builder /workspace/dist/senergy-web-ui/ /usr/share/nginx/html/
COPY --from=builder /workspace/dist/senergy-web-ui/assets/nginx-custom.conf /etc/nginx/conf.d/default.conf

EXPOSE 80