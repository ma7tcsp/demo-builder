#! /bin/bash
git add .
git commit -m "v1.12, warnings are now located in the view settings"
git push
docker stop testemb 
docker rm testemb 
docker image rm alteirac/emb
docker build . -t alteirac/emb
docker run -p 80:3000 -d --name testemb alteirac/emb
docker push alteirac/emb

