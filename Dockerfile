FROM node:17

WORKDIR /usr/src/app

COPY /build ./build
COPY package.json .


EXPOSE 8080

CMD ["npm", "start"]
