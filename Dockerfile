# Keep in sync with the puppeteer version in package-lock.json
FROM ghcr.io/puppeteer/puppeteer:23.5.3
USER root

WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
CMD [ "npm", "run", "start"]
