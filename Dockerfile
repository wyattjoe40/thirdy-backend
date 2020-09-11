FROM node:12

EXPOSE 3001

WORKDIR /usr/src/app

RUN ["npm", "install"]

COPY . .

CMD ["node", "index.js"]
