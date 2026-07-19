FROM node:20-alpine

WORKDIR /app

ARG VITE_API_URL=https://api.quizvnua.com/api/v1/
ARG VITE_AVATAR_URL=https://api.quizvnua.com
ARG VITE_GOOGLE_CLIENT_ID=

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_AVATAR_URL=$VITE_AVATAR_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

COPY package.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
