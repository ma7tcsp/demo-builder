node .\prepdeploy.js
git add .
git commit -m "v1.6.0, issues with images"
git push
docker stop testemb 
docker rm testemb 
docker image rm ma7tcsp/emb
docker build . -t ma7tcsp/emb
docker run -p 3001:3000 -d --name testemb ma7tcsp/emb
docker push ma7tcsp/emb
npm run dist
electron-builder --windows nsis:x64