var express = require('express');
var app = express();
var path = require('path');
const bodyParser = require('body-parser');
const https = require('https');
var xml2js  = require('xml2js');
var cors = require('cors');
var fs = require('fs');
const { unlink } = require('fs/promises');
const { json } = require('express');
Stream = require('stream').Transform;
//I+xY1SYEQ7K3BX/SmchsLg==:gVjDyWBEklrXnB8AfGEVmoQplXADoaUJ Tony
//qATEmPhkR9uW74NVs9FLYA==:ZTROORX8u5beCBPxZG6hUg8XkLGLpaGv Av
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function () {
  console.log('Example app listening on port '+port);
});

app.get('/refresh', async function (req, res) {
  try {
    await deleteImg();
    authenticate().then(async (resauth)=>{
      try {
        var v=await dumpViewPics(resauth.token,resauth.siteid);
        res.send("Job Done !");
      } catch (error) {
        console.log("err in dump",error);
      }
    });
  } catch (error) {
    console.log("err in auth or dump");
  }
})
app.get('/list', async function (req, res) {
  return list(req.get('host'),'eu-west-1a.online.tableau.com','avevatraining',"Advanced Analytics",'aveva','qATEmPhkR9uW74NVs9FLYA==:ZTROORX8u5beCBPxZG6hUg8XkLGLpaGv',res);
});
app.post('/list', async function (req, res) {
  var m=validateParam(req);
  if(m!="")
    res.send({message:m});
  else  
    return list(req.get('host'),req.body.host,req.body.site,req.body.project,req.body.tokenName,req.body.tokenValue,res);
});

function validateParam(req){
  var mess=""
  if(!req.body.host){
    mess+="Missing 'host' key in post body"
  }
  if(!req.body.site){
    mess+="<br>Missing 'site' key in post body"
  }
  if(!req.body.project){
    mess+="<br>Missing 'project' key in post body"
  }
  if(!req.body.tokenName){
    mess+="<br>Missing 'tokenName' key in post body"
  }
  if(!req.body.tokenValue){
    mess+="<br>Missing 'tokenValue' key in post body"
  }
  return mess;

}
function list(myhost,host,site,project,tokenName,tokenValue,res){
  try{
    authenticate(host,site,tokenName,tokenValue).then(async (resa)=>{
      try {
        if(resa.error)
          res.send({message:resa.error});
        else{
          var vs=await dumpViewPics(resa.token,host,resa.siteid,project);
          if(vs==null){
            res.send({message:`Project not found "${project}"`});
            return;
          }
          var jso=[]
          vs.map((v)=>{
            var js={}
            js.id=v.id;
            js.name=v.name;
            js.link=v.url;
            js.url=myhost+"/"+resa.siteid+hashCode(project)+"/"+v.id+".png";
            jso.push(js);
          })
          res.json(jso);
        }  
      } catch (err) {
        res.send({message:err});
      }
    });
  } catch (error){
    res.send({message:error});
  }
}
function deleteImg(){
  return new Promise( (resolve, reject)=>{
    const directory = "public/img/";
    var allDelete=[]
    fs.readdir(directory, (err, files) => {
      if (err) throw err;
      for (const file of files) {
        allDelete.push(unlink(path.join(directory, file)))
      }
      Promise.all(allDelete).then(()=>resolve());
    });
  })
}
function hashCode(str) {
  var hash = 0, i, chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr   = str.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; 
  }
  return hash;
};
async function looping(interval){
  setInterval(async () => {
    try {
      authenticate().then(async (res)=>{
        try {
          var v=await dumpViewPics(res.token,res.siteid);
        } catch (error) {
          console.log("err in dump")
        }
      });
    } catch (error) {
      console.log("err in auth or dump")
    }
  }, interval);
}
function getImage(token, host,siteid, pat,viewid,wid) {
    return new Promise((resolve, reject)=>{
	    //optionspath = encodeURI("/api/3.9/sites/" + siteid + "/views/" + viewid + "/image?maxAge=1&resolution=high");
      optionspath = encodeURI("/api/3.9/sites/" + siteid + "/workbooks/"+wid+"/views/" + viewid + "/previewImage");
      //optionspath = encodeURI("/api/3.9/sites/" + siteid + "/views/" + viewid + "/image?maxAge=1&resolution=high");
      var imgdata = new Stream();
      const https = require('https');
      const options = {
        hostname: host,
        port: 443,
        path: optionspath,
        encoding: 'null',
        method: 'GET',
        headers: {
          'x-tableau-auth': token
        }
      }
      const req = https.get(options, res => {
        res.on('data', function(chunk) {
          imgdata.push(chunk)
        })
        res.on('end', function() {
          try {
            fs.writeFileSync(pat+'/'+viewid+'.png', imgdata.read());
            resolve();
          } catch (error) {
            fs.createReadStream('public/empty.png').pipe(fs.createWriteStream(pat+'/'+viewid+'.png'));
            console.log("error ",error)
          }
        })

      })
      req.end()
    })
}
function getFolder(pat){
  if (!fs.existsSync("public/"+pat)) {
    fs.mkdirSync("public/"+pat);
  }
  return "public/"+pat;
}
function dumpViewPics(token,host,site,project){
  return new Promise(async (resolve, reject)=>{
    var pid=await getProjects(token,host,site,project);
    if(pid==null){
      resolve(pid);
      return;
    }
    var views=await getViews(token,host,site,pid);
    var existing=[];
    var mypath=getFolder(site+ hashCode(project));
    fs.readdir(mypath, (err, files) => {
      files.forEach(file => {
        existing.push(file)
      });
      var missingViews = views.filter(function(val) {
        var found=false;
        existing.map((ff)=>{
          if(ff.indexOf(val.id)!=-1)
            found=true;
        })
        return !found;
      });
      var allImg=[];
      missingViews.map((v)=>{
        allImg.push(getImage(token,host,site,mypath,v.id,v.wid));
        console.log(v.id, "thumbnail has been added!")
      })
      Promise.all(allImg).then(()=>{
        resolve(views);
      })
      var extraFiles = existing.filter(function(val) {
        var isThere=true;
        views.map((vv)=>{
          if(val.indexOf(vv.id)!=-1){
            isThere= false
            return;
          }
            
        })
        return isThere;
      });
      extraFiles.map((del)=>{
        try {
          fs.unlinkSync(mypath+del);
          console.log(del,"thumbnail has been deleted!")
        } catch(err) {
          console.error(err)
        }
      })

    });
  })
}
function getProjects(token, host,siteid, projectName) {
  return new Promise((resolve, reject)=>{
    optionspath = encodeURI("/api/3.9/sites/" + siteid + "/projects");
    var xmldata = "";
    const https = require('https');
    const options = {
      hostname: host,
      port: 443,
      path: optionspath,
      method: 'GET',
      headers: {
        'x-tableau-auth': token
      }
    }
    const req = https.request(options, res => {
      res.on('data', function(chunk) {
        xmldata += chunk;
      })
      res.on('end', function() {
        var parser = new xml2js.Parser();
        parser.parseString(xmldata, function(err, parsedXml) {
          if(parsedXml.tsResponse.projects){
            var res = parsedXml.tsResponse.projects[0].project;
            var id=null
            res.map((p)=>{
              if(p.$.name==projectName)
                id=p.$.id;
            })
            resolve (id);
          }
          else{
            resolve (null);
          }
          });
      })
    })
    req.end()
  })
}
function getViews(token,host,siteid,projectID) {
  return new Promise((resolve, reject)=>{
    var vs=[];
    optionspath = encodeURI("/api/3.9/sites/" + siteid + "/views");
    var xmldata = "";
    const https = require('https');
    const options = {
      hostname: host,
      port: 443,
      path: optionspath,
      method: 'GET',
      headers: {
        'x-tableau-auth': token
      }
    }
    const req = https.request(options, res => {
      res.on('data', function(chunk) {
        xmldata += chunk;
      })
      res.on('end', function() {
        var parser = new xml2js.Parser();
        parser.parseString(xmldata, function(err, parsedXml) {
          if(parsedXml.tsResponse.views){
            var res = parsedXml.tsResponse.views[0].view;
            res.map((v)=>{
              if(projectID && v.$ && v.project[0].$.id==projectID){
              vs.push({"id":v.$.id,"wid":v.workbook[0].$.id,"name":v.$.name,"url":v.$.contentUrl});
              }
            })
            resolve (vs);
          }
          else{
            console.log("err in getviews",projectID);
            resolve (null);
          }
        });
      })
    })
    req.end()
  })
}
function authenticate(host,site,tokenName,tokenValue) {
  return new Promise((resolve, reject)=>{
    try {
      var xmldata = "";
      var postdata = `<tsRequest><credentials personalAccessTokenName='${tokenName}' personalAccessTokenSecret='${tokenValue}'><site contentUrl='${site}' /></credentials></tsRequest>`;
      var options = {
        hostname: `${host}`,
        port: 443,
        path: '/api/3.9/auth/signin',
        method: 'POST',
        headers: {
          'Content-Type': 'text/json',
          'Content-Length':postdata.length
        }
      }
      const req = https.request(options, res => {
        res.on('data', function(chunk) {
          xmldata += chunk;
        })
        res.on('end', function() {
          var parser = new xml2js.Parser();
          parser.parseString(xmldata, function(err, parsedXml) {
            if(parsedXml.tsResponse.credentials){
              var token = parsedXml.tsResponse.credentials[0].$.token;
              var siteid = parsedXml.tsResponse.credentials[0].site[0].$.id;
              resolve ({token:token,siteid:siteid})
            } else{
              resolve({error:parsedXml.tsResponse.error[0].summary.join(',') +' / ' +parsedXml.tsResponse.error[0].detail.join(',')})
            }
          });
        })
    })
    req.on('error', function(err) {
      resolve({error:`${err}`})
    })  
    req.write(postdata);
    req.end();
  } catch (error) {
    reject ({"error":error});
  }
  })
  
}

app.use(express.static(path.join(__dirname, "/public")));
