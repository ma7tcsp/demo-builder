#! /bin/bash
git add .
git commit -m "v1.09, template load on last used view, improve loading a lot..."
git push
docker stop testemb 
docker rm testemb 
docker image rm alteirac/emb
docker build . -t alteirac/emb
docker run -p 80:3000 -d --name testemb alteirac/emb
docker push alteirac/emb

