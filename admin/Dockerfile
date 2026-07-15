FROM node:20-alpine

WORKDIR /app

ARG REACT_APP_API_URL=https://api.quizvnua.com/api/v1/
ARG REACT_APP_ADMIN_BASENAME=/

ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_ADMIN_BASENAME=$REACT_APP_ADMIN_BASENAME

COPY package.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

RUN npm install -g serve

EXPOSE 3001

CMD ["serve", "-s", "build", "-l", "3001"]
