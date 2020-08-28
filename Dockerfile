FROM node:10

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure package.json, package-lock.json and tsconfig.json are copied where available (npm@5+)
COPY *.json ./

RUN npm install

# Bundle app source
COPY . .

EXPOSE 2333