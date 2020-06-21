var express = require('express');
var router = express.Router();
var model = require('../model')
var mongoose=require('mongoose');

// 又是坑，需要将_id字符串转化为ObjectID
var ObjectID = require('mongodb').ObjectID;



/* GET users listing. */
router.get('/', function(req, res, next) {
  //console.log('从客户端发来的cookie是',req.signedCookies.id)

  //访问鉴权，先判断有没有cookie._id，然后判断cookie._id与查询数据库中的数据，判断用户是谁
  if(!req.signedCookies.id)
  return res.status(400).end('未登录')
  let id =req.signedCookies.id

  model.connect( function(db){
     db.collection('users').findOne({_id:ObjectID(id)}, function(err,ret){
      if(err)
      {
        //console.log('asd',err)
        res.status(402).end('访问错误')
      }
      else{
        console.log(ret)
      if(!ret){
        res.status(401).end('自动登陆失败')
      }else{
        console.log('DOCS',ret)
        //console.log('200 ',ret)
        model.connect(async function(db){
        await  db.collection('divides').find({'userid':id}).toArray(function(err,docs){
            if(err) return res.status(404)
            if(docs.length === 0) 
            {
              res.status(404).end()
            }
            else{
             
              let userdata = {
                username:ret.name,
                id:id,
                bg:ret.bg,
                divides:[]
                
              }

            
                  
                //  解决循环中执行异步操作的方案，差点没把我整自闭
                  let asyncF = function(i){
                    return new Promise(function(resolve,reject){
                      userdata.divides.push({id:mongoose.Types.ObjectId(docs[i]._id).toString(),name:docs[i].name,urls:[]})
                      model.connect(db => {                     
                     db.collection('urls').find({divideid:mongoose.Types.ObjectId(docs[i]._id).toString()}).toArray(function(err,docs1){
                        //console.log('DOCS',mongoose.Types.ObjectId(docs[i]._id).toString())
                         if(!docs1.length) resolve()
                         
                       for(let j = 0 ;j < docs1.length;j++)
                       {
                        userdata.divides[i].urls.push({name:docs1[j].name,url:docs1[j].url,id:mongoose.Types.ObjectId(docs1[j]._id),ico:docs1[j].ico})
                           if(j === docs1.length - 1) 
                           resolve()
                       } 
                        
                       })
                     })
                    })
                  }

                  let f = async function(){
                    for(let i = 0;i<docs.length;i++){
                     // console.log(i)
                      await asyncF(i)
                    }
                    res.status(200).json({meta:'success',data:userdata})
                  }
                 
                  f()         
            }
          })
        })      
      }
      }
    })
  })

});

// 用户注册
router.post('/regist',function(req,res,next){
  // console.log(req.headers)
  // console.log('bode--',req.body)
  let data = {
    name:req.body.username,
    password:req.body.password
  }
  console.log(data)
  // 连接数据库查询用户名是否存在
model.connect(function(db){
  db.collection('users').find({'name':data.name}).toArray(function(err,docs){
    //console.log(docs)
    if( docs.length > 0 )
    return res.status(400).json({meta:'注册失败',msg:'用户名已存在'})
    else {
     let newData = {
      name:data.name,
      password:data.password,
      bg:0
     }
     model.connect(function(db){
       db.collection('users').insertOne(newData,function(err,ret){
         if(err)
         {
          res.status(401).json({meta:'注册失败',msg:'写入数据库失败'})
         }
        else{
          // 创建用户成功，初始化用户信息
          //console.log(typeof ret.insertedId)
          model.connect(function(db){
            db.collection('divides').insertOne({name:'默认',userid:mongoose.Types.ObjectId(ret.insertedId).toString()},function(err,ret1){
              if(err) 
              res.status(402).end()
              else{
                console.log('ret1',ret1.insertedId)
                if(!ret1.insertedId) 
                res.status(403).end('创建失败')
                else{
                  let dividedID = mongoose.Types.ObjectId(ret1.insertedId).toString()
                 let origin =  [
                    {divideid:dividedID,name:'百度',url:'https://www.baidu.com/',ico:'https://www.baidu.com/favicon.ico'},
                    {divideid:dividedID,name:'bilibili',url:'https://www.bilibili.com/',ico:'https://www.bilibili.com/favicon.ico'},
                    {divideid:dividedID,name:'优酷',url:'https://www.youku.com/',ico:'https://img.alicdn.com/tfs/TB1WeJ9Xrj1gK0jSZFuXXcrHpXa-195-195.png'},
                    {divideid:dividedID,name:'京东',url:'https://www.jd.com/',ico:'https://www.jd.com/favicon.ico'},
                    {divideid:dividedID,name:'微博',url:'https://weibo.com/',ico:'https://weibo.com/favicon.ico'},
                    {divideid:dividedID,name:'腾讯视频',url:'https://v.qq.com/',ico:'https://v.qq.com/favicon.ico'},
                    {divideid:dividedID,name:'斗鱼',url:'https://www.douyu.com/',ico:'https://www.douyu.com/favicon.ico'},
                    {divideid:dividedID,name:'GitHub',url:'https://github.com/',ico:'https://github.com/favicon.ico'},        
                  ]
                  model.connect(function(db){
                    db.collection('urls').insertMany(origin,function(err,ret2){
                      console.log('123',ret2)
                      if(!ret2.insertedCount)
                      res.status(404).end('数据初始化失败')
                      else{
                        res.status(200).end()
                      }
                    })
                  })
                }
              }
              
            })
          })
          
        }
      })
     })
    }

  })
})
})

// 背景颜色
router.post('/bg',function(req,res,next){
    // 查询数据库
           //console.log(req)
           if(req.signedCookies)
           console.log('ID',req.signedCookies.id)
           console.log(req.body.colorid)
           let id = req.body.colorid
           model.connect(function(db){
            db.collection('users').findOne({_id:ObjectID(req.signedCookies.id)},function(err,ret){
              console.log('RET',ret)
            })
           })
           model.connect(function(db){
                 db.collection('users').updateOne({_id:ObjectID(req.signedCookies.id)},{$set:{"bg":id}},function(err,ret){
                   if(ret)
                   {
                   //  console.log(ret)
                    res.status(200).json({colorid:req.body.colorid})
                   }
                   
                 })
           })
           //else
           //res.status(400).end()
         

})

router.post('/login',function(req,res,next){
  res.cookie('id','ret._id')
  console.log('COOKIE',req.signedCookies);
  let data = {
    name:req.body.username,
    password:req.body.password
  }
  // 查询数据库
  model.connect(function(db){
    db.collection('users').findOne({'name':data.name,'password':data.password},function(err,ret){
      if(err)
      return res.status(402)
      else{
       if(!ret)
       {
        res.status(401).json({meta:'登陆失败',msg:'账号或密码错误'})
       }
       else{
         console.log(ret)
        //  
         res.cookie('id',ret._id,{signed:true,expires: new Date("December 31, 2024")})
         res.status(200).end()
       }
      }

    })
  })
})
// 删除元素
router.delete('/',function(req,res,next){
 // console.log('要删除的是' + req.body.url)
  let userid =req.signedCookies.id
  let id = req.body.id
  let user = req.body.user


  //console.log(name,url)
   model.connect(function(db){
     db.collection('users').findOne({name:user,_id:ObjectID(userid)},function(err,ret){
       if(err)
       res.status(400).end()
       else{
         console.log(ret)
         model.connect(function(db){
          db.collection('urls').remove({_id:ObjectID(id)},function(err,ret1){
            console.log(ret1)
            res.status(200).end() 
          })
         })
       }
     })
   })
})

// 删除分类 
router.delete('/divide',function(req,res,next){
  let userid = req.signedCookies.id
  let id = req.body.id
  let user = req.body.username
 // console.log(req)
model.connect(function(db){
  db.collection('users').findOne({name:user,_id:ObjectID(userid)},function(err,ret){
    if(err)
    res.status(400).end()
    else{
     console.log(ret)
     if(!ret)
     res.status(404).end()
     else{
       model.connect(function(db){
        db.collection('urls').remove({divideid:id},function(err,ret){
          model.connect(function(db){
            db.collection('divides').remove({_id:ObjectID(id)},function(err,ret){
              console.log(ret)
              if(ret){
                res.status(200).end()
              }
               else{
                 res.status(403).end()
               }
            })
           })           
        })
       })   
   
     }
    }
  })
})

})

module.exports = router;
