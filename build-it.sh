#! /bin/bash
node prepdeploy.js
git add .
git commit -m "v1.4.5, widget template, predefined loaded correctly when arriving not authenticated..."
git push
docker stop testemb 
docker rm testemb 
docker image rm alteirac/emb
docker build . -t alteirac/emb
docker run -p 80:3000 -d --name testemb alteirac/emb
docker push alteirac/emb

