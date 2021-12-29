
FROM mhart/alpine-node:slim-12


COPY package*.json ./

RUN npm install --production

EXPOSE 3000

COPY . . 

# Launch application
CMD ["node","app.js"]