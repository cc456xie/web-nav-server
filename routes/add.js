var express = require('express');
var router = express.Router();
var model = require('../model')
var ObjectID = require('mongodb').ObjectID;
var URL = require('../public/javascripts/urlTest')

router.post('/nav',function(req,res,next){
   // console.log(req.body)
    let originData = {
        username:req.body.username,
        name: req.body.name,
        url:req.body.url,
        divideid:req.body.id
    }
    console.log(originData)
    if(!req.signedCookies.id)
    return res.status(400).end('未登录')
    let id =req.signedCookies.id

    model.connect(function(db){      
        db.collection('users').findOne({name:originData.username},function(err,ret){
            if(err)
            {
                console.log('asd',err)
                res.status(402).end('访问错误')
            }
            else{

                console.log(id,ret._id)
                   let icoUrl
                   let index =  find(originData.url,'/',2)
                   if( index === -1 )
                    icoUrl = originData.url+'/favicon.ico'
                   else
                    icoUrl = originData.url.substring(0,index)+'/favicon.ico'
                    if(icoUrl.length <= 11)
                    return  res.status(401).end('添加失败')
                    console.log(icoUrl)
                    URL.loadPage(icoUrl).then((ret) =>{
                        console.log('40',ret)

                        if(ret){
                        ico = icoUrl
                        model.connect(function(db){
                            db.collection('urls').insertOne({divideid:originData.divideid,name:originData.name,url:originData.url,ico:ico
                            },function(err,ret1){
                                console.log(ret1)
                                if(ret1.result.ok > 0)
                                {
                                    res.status(200).end()
                                }
                            })
                        })                 
                        }
                        else{
                            model.connect(function(db){
                                db.collection('urls').insertOne({divideid:originData.divideid,name:originData.name,url:originData.url
                                },function(err,ret1){
                                    console.log(ret1)
                                    if(ret1.result.ok > 0)
                                    {
                                        res.status(200).end()
                                    }
                                })
                            })   
                        }
                        
  
                    })
                   
            }
        })
    })

})


router.post('/divide',function(req,res,next){
    console.log(req.body)
    if(!req.body || !req.signedCookies.id)  return

    let id = req.signedCookies.id
    model.connect(function(db){
        db.collection('users').findOne({_id:ObjectID(id),name:req.body.username},function(err,ret){
            if(err) return

            
            console.log(ret._id)
            model.connect(function(db){
                db.collection('divides').findOne({name:req.body.name,userid:id},function(err,ret){
                   if(err) return
                   console.log(ret)
                   if(!ret){
                       model.connect(function(db){
                           db.collection('divides').insertOne({name:req.body.name,userid:id},function(err,ret){
                              if(ret.insertedCount <= 0)
                              {
                                  res.status(402).end('添加失败')
                              }
                              else{
                                res.status(200).end('成功')
                              }
                           })
                       })
                   }
                   else{
                       res.status(401).end('分类已存在')
                   }
                })
            })
        })
    })

})

function find(str,cha,num){
    var x=str.indexOf(cha);
    for(var i=0;i<num;i++){
        x=str.indexOf(cha,x+1);
    }
    return x;
    }




module.exports = router;