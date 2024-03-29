
FROM node:latest as build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --force

COPY . .

RUN npm run build

FROM nginx:latest

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
