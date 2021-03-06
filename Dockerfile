FROM node:6.10

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install --production

COPY index.js /usr/src/app/

CMD [ "npm", "start" ]
