FROM node:20-alpine

WORKDIR /app

ARG REACT_APP_API_URL=https://api.quizvnua.com/api/v1/
ARG REACT_APP_AVATAR_URL=https://api.quizvnua.com
ARG REACT_APP_GOOGLE_CLIENT_ID=

ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_AVATAR_URL=$REACT_APP_AVATAR_URL
ENV REACT_APP_GOOGLE_CLIENT_ID=$REACT_APP_GOOGLE_CLIENT_ID

COPY package.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"]
