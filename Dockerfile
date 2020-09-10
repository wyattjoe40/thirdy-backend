FROM node:12

EXPOSE 3001

WORKDIR /usr/src/app

COPY . .

RUN ["npm", "install", "bcrypt"]

CMD ["node", "index.js"]
