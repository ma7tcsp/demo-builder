#! /bin/bash
node prepdeploy.js
git add .
git commit -m "v1.4.4, widget template, better loader management if authentication or not"
git push
docker stop testemb 
docker rm testemb 
docker image rm alteirac/emb
docker build . -t alteirac/emb
docker run -p 80:3000 -d --name testemb alteirac/emb
docker push alteirac/emb

