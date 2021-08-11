
FROM node:latest


COPY package*.json ./

RUN npm install

EXPOSE 3000

COPY . . 

# Launch application
CMD ["node","app.js"]