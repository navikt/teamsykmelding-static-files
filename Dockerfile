FROM node:17

WORKDIR /usr/src/app
COPY . .


EXPOSE 8080

CMD ["npm", "start"]
