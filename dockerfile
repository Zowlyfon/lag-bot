# Base node version
FROM node:16 as base

WORKDIR /src

COPY . .

COPY package*.json ./
# Expose a certain port
EXPOSE 4000

# Installs modules from package-lock.json, this ensures reproducible build
#   When crashing please use npm i in your repository first!
RUN npm ci

# Final command for deployment
CMD ["npm","run","run"]