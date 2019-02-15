var request = require('request');
const data = require('./send.js');
const fs = require('fs');
const download = require('download');
const randomstring = require("randomstring");
let image = url=>{
    return new Promise(resolve => {
        download(url).then(data => {
            let name = './images/'+randomstring.generate()+'.png';
            fs.writeFileSync(name, data);
            resolve(name)
        });
    })
};
function unicodeToChar(text) {
    return text.replace(/\\u[\dA-F]{4}/gi,
        function (match) {
            return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
        });
}

let id = (text,startS,lastS)=>{
    let start = text.indexOf(startS) + startS.length;
    let last = text.indexOf(lastS,start);
    let sub = text.substring(
        start,last
    );
    return sub;
};
let fb_dtsg_ACTION = (cookie,agent)=>{
    return new Promise(resolve => {
        let option = {
            method:'get',
            url:'https://www.facebook.com/',
            headers: {
                'User-Agent': agent,
                'Cookie': cookie,
                'Accept': '/',
                'Connection': 'keep-alive',
            },


        };
        request(option, function (err,res,body) {
            if(body.includes('https://www.facebook.com/login')){
                return resolve(false)
            }else{
                let value = id(body,'name="fb_dtsg" value="','"');
                let privacy = id(body,'name="privacyx" value="','"');

                return resolve({value:value,privacy:privacy})
            }
        });
    })
}

let uploadImg = ({cookie,path,agent,fb_dtsg,av})=>{
    return new Promise(resolve => {
        let option = {
            method:'post',
            url: 'https://upload.facebook.com/ajax/react_composer/attachments/photo/upload?av='+av+'&dpr=1&__user='+id(cookie,"c_user=",";")+'&__a=1&__dyn=7AgNe-4amaAxd2u6aJGeFxqeCwDKEyGgS8zQC-C267Uqzob4q2i5U4e2C3-u5RUC6UnG2iuUG4XzEa8iGu3yaUS2SVFEgU9A5Kuifz8nxm3i2y9xa2m4oqwi88-EnAgeGxW5oiwlUWum1oxy2Su4rG7468nxKER3SGwgFoaXyUG58oxadUb9EaK5aGfKEgy8do9EOEyh7yVEhyo8fixK8BojUy6F4fzaG9BKmU-fxbCxSazUycVEkx6h7GEkHxC6by4h4Bx3CDKi8wGxm4UGqbK264oKu8Kazqxq8xK3t3FK9G5Aby8kwwz8&__req=5e&__be=1&__pc=PHASED%3Aufi_home_page_pkg&__rev=4590095&fb_dtsg='+fb_dtsg+'&jazoest=26581695271110110785710345835865817270100109874848577176&__spin_r=4590095&__spin_b=trunk&__spin_t=1543848925',
            headers: {
                'User-Agent': agent,
                'Cookie': cookie,
                'Accept': '/',
                'Connection': 'keep-alive',
                "Content-Type": "multipart/form-data"
            },

            formData : {

                target_id:id(cookie,"c_user=",";"),
                source:8,
                profile_id:id(cookie,"c_user=",";"),
                waterfallxapp:'web_react_composer',
                upload_id:1024,
                "farr" : fs.createReadStream(path)
            },

        };
        request(option, function (err,res,body) {
            resolve(id(body,'"photoID":"','"'))
        })
    })
};
let idPost = ({type,story_id,privacy,cookie,agent,fb_dtsg})=>{
    return new Promise(resolve => {
        let option = {
            method:'post',
            url:'https://www.facebook.com/async/publisher/creation-hooks/?av='+id(cookie, "c_user=", ";"),
            headers: {
                'User-Agent': agent,
                'Cookie': cookie,
                'Accept': '/',
                'Connection': 'keep-alive'
            },
            form:{
                "story_id": story_id,
                "__user": id(cookie, "c_user=", ";"),
                "__a": "1",
                "fb_dtsg":fb_dtsg,
                'data[web_graphml_migration_params][is_also_posting_video_to_feed]':'false',
                'data[web_graphml_migration_params][target_type]':'feed',
                'data[web_graphml_migration_params][xhpc_composerid]':'rc.u_0_1u',
                'data[web_graphml_migration_params][xhpc_context]':'profile',
                'data[web_graphml_migration_params][xhpc_publish_type]':'1',
                'data[web_graphml_migration_params][xhpc_timeline]':'true',
                'data[is_local_dev_platform_app_instance]':'false',
                'data[is_page_recommendation]':'false',
                'data[logging_ref]':'timeline',
                'data[message_text]':''

            }

        };
        if(type === 'timeline'){
            option.form['data[audience][web_privacyx]'] = privacy;
        }else if(type === 'group'){
            option.form['data[audience][to_id]'] = '1127631477343793'
        }else if(type === 'page'){
            option.form['data[audience][privacy][base_state]'] = 'everyone'

        }
        request(option, function (err,res,body) {
            if(type === 'timeline'){
                let idp = id(body,'"privacy_fbid":"','"');
                resolve(idp)
            }else if(type === 'group'){
                let idp = id(body,'post_id=','&');
                resolve(idp)
            }else if(type === 'page'){
                let idp = id(body,'"contentID":"','"');
                resolve(idp)
            }
        })
    })

};
let uploadPost = ({privacy,cookie,agent,content,color,photoID,youtube,location,postLinkFaceObj,fb_dtsg})=>{
    return new Promise(resolve => {
        let option = {
            method:'post',
            url:'https://www.facebook.com/webgraphql/mutation/?doc_id=1740513229408093&dpr=1',
            headers: {
                'User-Agent': agent,
                'Cookie': cookie,
                'Accept': '/',
                'Connection': 'keep-alive'
            },
            form:{
                "variables": JSON.stringify(data(location,id(cookie,"c_user=",";"),content,color,photoID,postLinkFaceObj,youtube)),
                "__user":id(cookie,"c_user=",";"),
                "__a":"1",
                "fb_dtsg":fb_dtsg

            }

        };
        request(option, async function (err,res,body) {

            if(location.timeline !== null && location.timeline !== undefined && location.timeline !== '' ){
                body = JSON.parse(body.replace('for (;;);','')).payload;
                if(body.errors !== null && body.errors !== undefined){

                    return  resolve({error:body.errors[0].description,postID:null,type:'timeline'})

                }else if(body.data.story_create !== null) {
                    let idp = await idPost({type:'timeline',story_id:body.data.story_create.story.id,cookie,agent,fb_dtsg,privacy})
                    return resolve({error:null,postID:idp,type:'timeline'})
                }else if(body === undefined){
                    return  resolve({error:'Hết thuốc chữa',postID:null,type:'timeline'})

                }

            }else if(location.group !== null && location.group !== undefined && location.group !== ''){
                body = JSON.parse(body.replace('for (;;);','')).payload;
                if(body.errors !== null && body.errors !== undefined){
                    return  resolve({error:body.errors[0].description,postID:null,type:'group'})

                }else if(body.data.story_create !== null) {
                    let idp = await idPost({type:'group',story_id:body.data.story_create.story.id,cookie,agent,fb_dtsg,privacy});
                    return resolve({error:null,postID:idp,type:'group'})
                }

            }else if(location.page !== null && location.page !== undefined && location.page !== ''){
                body = JSON.parse(body.replace('for (;;);','')).payload;
                if(body.errors !== null && body.errors !== undefined){
                    return  resolve({error:body.errors[0].description,postID:null,type:'page'})

                }else if(body.data.story_create !== null) {
                    let idp = await idPost({type:'page',story_id:body.data.story_create.story.id,cookie,agent,fb_dtsg,privacy});
                    return resolve({error:null,postID:idp,type:'page'})
                }
            }


        })
    })
};
let getSee = ({cookie,agent,youtube,fb_dtsg})=>{
    return new Promise(resolve => {
        let option = {
            method:'post',
            url:'https://www.facebook.com/react_composer/scraper/?composer_id=rc.js_16a&target_id='+id(cookie,"c_user=",";")+'&scrape_url='+youtube+'&entry_point=timeline&source_attachment=STATUS&source_logging_name=link_pasted&av='+id(cookie,"c_user=",";")+'&dpr=1',
            headers: {
                'User-Agent': agent,
                'Cookie': cookie,
                'Accept': '/',
                'Connection': 'keep-alive',
                'Content-type': 'application/x-www-form-urlencoded',
            },
            form:{

                "__user":id(cookie,"c_user=",";"),
                "__a":"1",
                "fb_dtsg":fb_dtsg

            }

        };
        request(option, async function (err,res,body) {

            let obj = {};
            obj.link = youtube;
            obj.external_author_id = id(body,'"external_author_id":"','"');
            obj.title = id(body,'"title":"','"')
            obj.content = id(body,'"summary":"','"')

            obj.images = id(body,'"images":',',').replace(/[&\/\\]/g,'vietnamesebkav2018').replace(/vietnamesebkav2018vietnamesebkav2018/g,'/');



            obj.global_share_id = id(body,'"global_share_id":',',');
            obj.secure_url = id(body,'"secure_url":"','"').replace(/[&\/\\]/g,'vietnamesebkav2018').replace(/vietnamesebkav2018vietnamesebkav2018/g,'/');
            obj.url_scrape_id = id(body,'"url_scrape_id":"','"');
            obj.hmac = id(body,'"hmac":"','"');



            resolve(obj)
        })
    })
};
let getSee2 = ({cookie,agent,postLink,fb_dtsg})=>{
    return new Promise(resolve => {
        let option = {
            method:'post',
            url:'https://www.facebook.com/react_composer/scraper/?composer_id=rc.js_16a&target_id='+id(cookie,"c_user=",";")+'&scrape_url='+postLink+'&entry_point=timeline&source_attachment=STATUS&source_logging_name=link_pasted&av='+id(cookie,"c_user=",";")+'&dpr=1',
            headers: {
                'User-Agent': agent,
                'Cookie': cookie,
                'Accept': '/',
                'Connection': 'keep-alive',
                'Content-type': 'application/x-www-form-urlencoded',
            },
            form:{

                "__user":id(cookie,"c_user=",";"),
                "__a":"1",
                "fb_dtsg":fb_dtsg

            }

        };
        request(option, async function (err,res,body) {

            let obj = {};
            obj.link = postLink;
            if(!postLink.includes('facebook.com')){
                obj.external_author_id = 'p'+id(body,'"external_author_id":"','"');
                obj.title = id(body,'"title":"','"')
                obj.content = id(body,'"summary":"','"')

                let linkImages =  id(body,'"images":',',').replace(/[&\/\\]/g,'vietnamesebkav2018').replace(/vietnamesebkav2018vietnamesebkav2018/g,'/');

                obj.images = linkImages.includes(']')?linkImages:linkImages+']';

                obj.global_share_id = id(body,'"global_share_id":',',');
                obj.secure_url = id(body,'"secure_url":"','"').replace(/[&\/\\]/g,'vietnamesebkav2018').replace(/vietnamesebkav2018vietnamesebkav2018/g,'/');
                obj.url_scrape_id = id(body,'"url_scrape_id":"','"');
                obj.hmac = id(body,'"hmac":"','"');
            }
            console.log(obj);



            resolve(obj)
        })
    })
};

let run = async ({location,cookie,agent,content,ImageArr,color,postLink,youtubeLink})=>{

    let fb_dtsg_ALL = await fb_dtsg_ACTION(cookie,agent);
    if(fb_dtsg_ALL === false){
        return {error:'400'}
    }
    let fb_dtsg = fb_dtsg_ALL.value;
    let privacy = fb_dtsg_ALL.privacy;


    let youtube = null;
    let postLinkFaceObj = {};
    let av = null;
    let photoID = [];


    if(ImageArr.length > 0){
        let photoIDarray = ImageArr.map(async e=>{
            let path = await image(e);

            if(location.timeline !== null && location.timeline !== undefined && location.timeline !== ''){
                av = id(cookie,"c_user=",";");
            }else if(location.group !== null && location.group !== undefined && location.group !== ''){
                av = id(cookie,"c_user=",";");
            }else if(location.page !== null && location.page !== undefined && location.page !== ''){
                av = location.page.id;
            }
            let result = await uploadImg({cookie:cookie,path:path,agent:agent,fb_dtsg:fb_dtsg,av:av});
            await fs.unlinkSync(path);
            return result
        });
        photoID = await Promise.all(photoIDarray);

    }else if(postLink != null && postLink !== undefined && postLink !== ''){


        if(postLink.includes('facebook.com')){
            if( postLink.includes('story_fbid=')){
                postLinkFaceObj.share_type = 22;

                postLinkFaceObj.postID = id(postLink,'story_fbid=','&')
            }else if(postLink.includes('/posts/')){
                postLinkFaceObj.share_type = 22;
                if(postLink.includes('?')){
                    postLinkFaceObj.postID = id(postLink,'/posts/','?')

                }else{
                    postLinkFaceObj.postID = postLink.substr(postLink.indexOf('/posts/')+'/posts/'.length).trim().replace('/','')

                }

            }else if(postLink.includes('/permalink/') && postLink.includes('/groups/')){
                postLinkFaceObj.share_type = 37;
                postLinkFaceObj.postID = postLink.substr(postLink.indexOf('/permalink/')+'/permalink/'.length).trim().replace('/','')
            }else if(postLink.includes('/?type=')){
                postLinkFaceObj.share_type = 2;
                let end = postLink.indexOf('/?type');
                let start = postLink.lastIndexOf('/',end-1)+1;
                postLinkFaceObj.postID = postLink.slice(start,end);
            }else if(postLink.includes('?__tn__=-R')){
                postLinkFaceObj.share_type = 22;
                postLinkFaceObj.postID = id(postLink,'/posts/','?__tn__=-R')
            }else if(postLink.includes('/videos/')){

                postLinkFaceObj.share_type = 11;
                postLinkFaceObj.postID = postLink.substr(postLink.indexOf('/videos/')+'/videos/'.length).trim().replace('/','')

                console.log(postLinkFaceObj)
            }

        }else{
            youtube = await getSee2({cookie:cookie,agent:agent,postLink:postLink,fb_dtsg:fb_dtsg});
        }



    }else if(youtubeLink != null && youtubeLink !== undefined && youtubeLink !== ''){

        youtubeLink += '&list=RDb73BI9eUkjM&index=3';

        youtube = await getSee({cookie:cookie,agent:agent,youtube:youtubeLink,fb_dtsg:fb_dtsg});



    }


    let upload = await uploadPost({privacy:privacy,cookie:cookie,agent:agent,content:content,color:color,photoID:photoID,postLinkFaceObj:postLinkFaceObj,youtube:youtube,location:location,fb_dtsg:fb_dtsg});


    if(upload.error === '' && isNaN(upload.postID) === true && upload.type === 'group'){

        upload = await run({location,cookie,agent,content,ImageArr,color,postIDseen,youtubeLink});
    }

    return upload


};
module.exports = run;