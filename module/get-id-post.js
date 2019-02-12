const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
let FINDid = (text,startS,lastS)=>{
    let start = text.indexOf(startS) + startS.length;
    let last = text.indexOf(lastS,start);
    let sub = text.substring(
        start,last
    );
    return sub;
};
let fb_dtsg_ACTION = ({cookie,agent})=>{
    return new Promise(resolve=> {
        let option = {
            method: 'get',
            url: 'https://m.facebook.com',
            headers: {
                "User-Agent": agent,
                "Cookie":cookie,
            },

        };
        request(option, function (err, res, body) {
            if(body.includes('https://www.facebook.com/login')){
                resolve(false)
            }else {
                resolve(FINDid(body, 'name="fb_dtsg" value="', '"'))
            }
        });
    });
};


let getPostTimeline = ({url,cookie,agent})=>{
    return new Promise(resolve=> {
        let option = {
            method: 'get',
            url: url,
            headers: {
                "User-Agent": agent,
                "Cookie":cookie,
            },

        };
        request(option, function (err, res, body) {
            let url = undefined;
            if(body.includes('for (;;);')){
                let textCursor = JSON.parse(body.replace('for (;;);','')).payload.actions[2].code;
                url = 'https://m.facebook.com/profile/timeline/stream/?cursor='+FINDid(textCursor,'cursor=','"');
                url = url.replace(/\\u0025/g,'%');
                body = JSON.parse(body.replace('for (;;);','')).payload.actions[0].html;
            }else {
                
            
                body = body.replace(/<!--/g,'');
            }

            let $ = cheerio.load(body);
            let listPost = [];
            $("article[data-store*='top_level_post_id.']").each(function () {
                let textID = $(this).attr('data-store');
                let id = FINDid(textID,'top_level_post_id.',':');
                listPost.push(id)
            });
            return resolve({listPost,url})

        });
    });
};
let getPostGroup = ({url,cookie,agent})=>{
    return new Promise(resolve=> {
        let option = {
            method: 'get',
            url: url,
            headers: {
                "User-Agent": agent,
                "Cookie":cookie,
            },

        };
        request(option, function (err, res, body) {
            resolve(FINDid(body,'mf_story_key.',':top_level_post_id'))
        });
    });

};
let getPostPage = ({url,cookie,agent,fb_dtsg})=>{
    return new Promise(resolve=> {
        let option = {
            method: 'post',
            url: url,
            headers: {
                "User-Agent": agent,
                "Cookie":cookie,
            },
            form:{
                "__user": FINDid(cookie, "c_user=", ";"),
                "fb_dtsg":fb_dtsg,
            }

        };
        request(option, function (err, res, body) {
            body = JSON.parse(body.replace('for (;;);','')).payload.actions[0].html;
            let $ = cheerio.load(body);
            let id = FINDid($("article").eq(0).attr('data-store'),'mf_story_key.',':top_level_post_id')
            return resolve(id)
        });
    });

};
module.exports = async ({id,type,num,cookie,agent})=>{
    let fb_dtsg = await fb_dtsg_ACTION({cookie,agent});
    if(fb_dtsg === false){
        return {error:'400'}
    }
    if(type === 'timeline'){
                let  url = 'https://m.facebook.com/profile/timeline/load_timeline_section/?cursor&profile_context_data[profile_id]='+id+'&profile_id='+id+'&replace_id=u_0_z&time_end=0&time_start=0';

        let result = [];
        num = parseInt(num);
        let getListPost = async url=>{
            let data = await getPostTimeline({url,cookie,agent});
            result = result.concat(data.listPost);
            url = data.url;
            if(url === undefined){
                return result;
            }
            if(result.length > num){
                result = result.slice(0,num);
                return result
            }else {
                return await getListPost(url);
            }
        };
        return await getListPost(url)
    }else if(type === 'group'){
        let url = 'https://m.facebook.com/'+id;
        let data = await getPostGroup({url,cookie,agent});
        return data;
    }else if (type === 'page'){
        let url = 'https://m.facebook.com/page_content_list_view/more/?page_id='+id+'&start_cursor=16&num_to_fetch=4&surface_type=timeline';
        let data = await getPostPage({url,cookie,agent,fb_dtsg});
        return data;
    }
};