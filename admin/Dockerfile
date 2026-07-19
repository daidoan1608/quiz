FROM node:22-alpine

WORKDIR /app

ARG VITE_API_URL=https://api.quizvnua.com/api/v1/
ARG VITE_ADMIN_BASENAME=/

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_ADMIN_BASENAME=$VITE_ADMIN_BASENAME

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

RUN npm install -g serve

EXPOSE 3001

CMD ["serve", "-s", "dist", "-l", "3001"]
