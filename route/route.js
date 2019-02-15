const express = require('express');
const route = express.Router();
const fbpost = require('../module/fbpost/post');
const getAllJoinGroup = require('../module/get-all-join-group');
const {Friends,fb_dtsg_ACTION} = require('../module/get-all-friend');
const getAllPage = require('../module/get-all-page');
const searchPost = require('../module/search-post');
const searchPage = require('../module/search-page');
const searchGroup = require('../module/search-group');
const joinGroup = require('../module/join-group');
const like = require('../module/like');
const deleteFriend = require('../module/delete-friend');
const addFriend = require('../module/add-friend');
const getIdLiker_Page = require('../module/get-id-liker/page');
const getIdLiker_Post = require('../module/get-id-liker/post');
const getIdComment_Post = require('../module/get-id-comment/post');
const comment = require('../module/comment');
const getUserInGroup = require('../module/get-user-in-group');
const info = require('../module/info');
const getIdPost = require('../module/get-id-post');
route.post('/get-id-post',async (req,res)=>{
    let data = JSON.parse(req.body['0']);
    let obj = {
        id:data.id || null,
        num:data.num || 0,
        type:data.type || null,
        cookie:data.cookie || null,
        agent:data.agent || null
    };
    if(obj.type === null){
        return res.send("Bạn phải xác định thuộc tính 'type' là timeline hay group,page !")
    }
    if(obj.id === null){
        return res.send('Bạn phải xác định id')
    }
    let result = await getIdPost(obj);
    res.send(result)
});

route.post('/get-user-in-group',async (req,res)=>{
    let data = JSON.parse(req.body['0']);
    let obj = {
        id:data.id || null,
        num:data.num || 0,
        cookie:data.cookie || null,
        agent:data.agent || null
    };
    let result = await getUserInGroup(obj);
    res.send(result)
});
route.post('/get-id-comment',async (req,res)=>{
    let data = JSON.parse(req.body['0']);
    let obj = {
        id:data.id || null,
        cookie:data.cookie || null,
        agent:data.agent || null
    };
    let result = await getIdComment_Post(obj);
    res.send(result)
});
route.post('/post',async (req,res)=>{
    let data = JSON.parse(req.body['0']);

    let obj = {
        cookie:data.cookie,
        agent:data.agent,
        content:data.content,
        ImageArr:data.ImageArr || [],
        color:data.color,
        postLink:data.postLink || null,
        youtubeLink:data.youtubeLink,
        group:data.group || null,
        page:data.page || null
    };


    if(data.type === 'timeline'){
        obj.location =  {
            timeline:true,
            group:null,
            page:null
        }
    }else if(data.type === 'group'){
        obj.location =  {
            timeline:null,
            group:{
                id:data.group
            },
            page:null
        }
    }else if(data.type === 'page'){
        obj.location =  {
            timeline:null,
            group:null,
            page:{
                id:data.page
            },
        }
    }

    let post = await fbpost(obj);

    res.send(post)

});
route.post('/get-all-join-group',async (req,res)=>{
    let data = JSON.parse(req.body['0']);
    let obj = {
        cookie:data.cookie || null,
        agent:data.agent || null
    };
    let result = await getAllJoinGroup(obj);
    res.send(result)

});
route.post('/get-all-page',async (req,res)=>{
    let data = JSON.parse(req.body['0']);
    let obj = {
        cookie:data.cookie || null,
        agent:data.agent || null
    };
    let result = await getAllPage(obj);
    res.send(result)
});
route.post('/get-all-friend',async (req,res)=>{
    let data = JSON.parse(req.body['0']);
    res.writeHead(200, {
        'Content-Type' : 'text/plain; charset=utf-8',
        'Transfer-Encoding' : 'chunked',
        'X-Content-Type-Options' : 'nosniff'
    });
    let cookie = data.cookie || null;
    let agent = data.agent || null;
    let url = 'https://m.facebook.com/profile.php?v=friends';
    let fb_dtsg = await fb_dtsg_ACTION({cookie,agent});
    if(fb_dtsg === false){
        return res.send({error:'400',result:[]})
    }else {
        let getFriend = async ({url,cookie,agent,fb_dtsg})=>{

            let data = await Friends({url,cookie,agent,fb_dtsg});
            res.write(JSON.stringify(data.list_friend));

            if(data.link_next !== undefined){
                url = 'https://m.facebook.com' + data.link_next;
                return await getFriend({url,cookie,agent,fb_dtsg})
            }else {
                return ''
            }
        };
        let close = await getFriend({url,cookie,agent,fb_dtsg});
        res.end(close)
    }
});
route.post('/search-group',async (req,res)=>{
    let data = JSON.parse(req.body['0']);
    let obj = {
        cookie:data.cookie || null,
        agent:data.agent || null,
        keyword:data.keyword || null,
        num_group_require:data.num_group_require || null
    };
    let result = await searchGroup(obj);

    res.send(result)
});
route.post('/search-post',async (req,res)=>{
    let data = JSON.parse(req.body['0']);
    let obj = {
        cookie:data.cookie || null,
        agent:data.agent || null,
        keyword:data.keyword || null,
        num_post_require:data.num_post_require || null
    };
    let result = await searchPost(obj);
    res.send(result)
});
route.post('/search-page',async (req,res)=>{
    let data = JSON.parse(req.body['0']);
    let obj = {
        cookie:data.cookie || null,
        agent:data.agent || null,
        keyword:data.keyword || null,
        num_page_require:data.num_page_require || null
    };
    let result = await searchPage(obj);
    res.send(result)
});
route.post('/like',async (req,res)=>{
    let data = JSON.parse(req.body['0']);
    let obj = {
        cookie:data.cookie || null,
        agent:data.agent || null,
        id_post:data.id_post || null,
        reaction:data.reaction || null
    };
    let result = await like(obj);
    res.send(result)
});
route.post('/join-group',async (req,res)=>{
    let data = JSON.parse(req.body['0']);
    let obj = {
        cookie:data.cookie || null,
        agent:data.agent || null,
        id:data.id || null
    };
    let result = await joinGroup(obj);
    res.send(result)
});
route.post('/delete-friend',async (req,res)=>{
    let data = JSON.parse(req.body['0']);
    let obj = {
        cookie:data.cookie || null,
        agent:data.agent || null,
        id:data.id || null
    };
    let result = await deleteFriend(obj);
    res.send(result)
});
route.post('/comment',async (req,res)=>{
    let data = JSON.parse(req.body['0']);
    let obj = {
        cookie:data.cookie || null,
        agent:data.agent || null,
        id_post:data.id_post || null,
        text:data.text || null
    };
    let result = await comment(obj);
    res.send(result)
});
route.post('/add-friend',async (req,res)=>{
    let data = JSON.parse(req.body['0']);
    let obj = {
        cookie:data.cookie || null,
        agent:data.agent || null,
        id:data.id || null
    };
    let result = await addFriend(obj);
    res.send(result)
});
route.post('/info',async (req,res)=>{
    let data = JSON.parse(req.body['0']);
    let obj = {
        cookie:data.cookie || null,
        agent:data.agent || null,

    };
    let result = await info(obj);
    res.send(result)
});
route.post('/get-id-liker-page',async (req,res)=>{
    let data = JSON.parse(req.body['0']);
    let obj = {
        cookie:data.cookie || null,
        agent:data.agent || null,
        id_page:data.id_page || null,
        limit:data.limit || null

    };
    let result = await getIdLiker_Page(obj);
    res.send(result)
});
route.post('/get-id-liker-post',async (req,res)=>{
    let data = JSON.parse(req.body['0']);
    let obj = {
        cookie:data.cookie || null,
        agent:data.agent || null,
        id_post:data.id_post || null,
        reaction:data.reaction || null

    };
    let result = await getIdLiker_Post(obj);
    res.send(result)
});

module.exports = route;