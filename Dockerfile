FROM node:17.9.0-buster-slim as builder
WORKDIR /app
COPY ["package.json", "yarn.lock", "./"]
RUN yarn install
COPY . .
CMD ["yarn", "start:dev"]
