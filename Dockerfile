FROM node:10.7.0-alpine

RUN mkdir /opt/rebel-command-center/
WORKDIR /opt/rebel-command-center/

COPY ./ ./
RUN npm install

EXPOSE 3001

CMD ["npm", "run", "prod"]
