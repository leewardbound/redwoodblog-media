###########################################################################################
# Runner: node
###########################################################################################

FROM node:16 as runner

# Node
ARG NODE_ENV
ARG RUNTIME_ENV
ENV NODE_ENV=$NODE_ENV
ENV RUNTIME_ENV=$RUNTIME_ENV
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

# Set workdir
WORKDIR /app

RUN mkdir -p /app/api /app/web
COPY api/package.json /app/api/package.json
COPY web/package.json /app/web/package.json
COPY .nvmrc .
COPY babel.config.js .
COPY graphql.config.js .
COPY package.json .
COPY redwood.toml .
COPY yarn.lock .

# Install dependencies
RUN yarn install

# Set api as workdirectory
WORKDIR /app

# Expose RedwoodJS api port
EXPOSE 8910
EXPOSE 8911
