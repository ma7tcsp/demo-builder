#! /bin/bash
node prepdeploy.js
git add .
git commit -m "v1.3.3, widget beta almost ready, need regression test"
git push
docker stop testemb 
docker rm testemb 
docker image rm alteirac/emb
docker build . -t alteirac/emb
docker run -p 80:3000 -d --name testemb alteirac/emb
docker push alteirac/emb

