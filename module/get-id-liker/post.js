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
                resolve(false)
            }else {
                let fb_dtsg_main = FINDid(body, 'name="fb_dtsg" value="', '"');
                let fb_dtsg_token = FINDid(body, '"async_get_token":"', '"');
                resolve({fb_dtsg_main, fb_dtsg_token})
            }
        });
    })
};

let Num_Reaction = ({id_post,cookie,agent,fb_dtsg})=>{
    return new Promise(resolve=> {
        let option = {
            method: 'post',
            url: 'https://m.facebook.com/ufi/reaction/profile/browser/?ft_ent_identifier='+id_post+'&fb_dtsg_ag='+fb_dtsg.fb_dtsg_token.replace(/:/g,'%3A')+'&__user='+FINDid(cookie, "c_user=", ";"),

            headers: {
                "User-Agent": agent,
                "Cookie":cookie,
            },
            form: {
                "__user": FINDid(cookie, "c_user=", ";"),
                "fb_dtsg": fb_dtsg.fb_dtsg_main,

            }

        };
        request(option, function (err, res, body){
            let num_like = FINDid(body,'reaction_type=1&total_count=','&');
            let num_heart = FINDid(body,'reaction_type=2&total_count=','&');
            let num_lol = FINDid(body,'reaction_type=3&total_count=','&');
            let num_surprise = FINDid(body,'reaction_type=4&total_count=','&');
            resolve({num_like,num_heart,num_lol,num_surprise})

        });
    });
};
let getIDfacebook = (surname)=>{
    return new Promise(resolve=>{
        let option = {
            url:'https://findmyfbid.com/',
            method:'POST',
            headers:{
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36'
            },
            form:{
                url:'https://www.facebook.com/'+surname
            }
        };
        request(option,(err,res,body)=>{
            resolve(JSON.parse(body).id)
        })
    });
};
let Reaction_Int = ({url,id_post,cookie,agent,fb_dtsg})=>{
    return new Promise(resolve=> {
        let option = {
            method: 'post',
            url:url,
            headers: {
                "User-Agent": agent,
                "Cookie":cookie,
            },
            form: {
                "__user": FINDid(cookie, "c_user=", ";"),
                "fb_dtsg": fb_dtsg.fb_dtsg_main,



            }

        };
        request(option, async function (err, res, body) {
            let final = [];
            body = body.replace('for (;;);','');
            if(JSON.parse(body).payload.actions[3]){
                let data =  JSON.parse(body).payload.actions[3].code;
                let result = [];
                function run(pos){
                    let start = data.indexOf('MFriendDynamicSubtitle',pos);
                    let end = data.indexOf('],1]',start);
                    let par = data.slice(start,end).split(',').pop();

                    if(par){
                        result.push(par)
                    }

                    if(start > 0){
                        return run(end)

                    }else{
                        return result
                    }
                }
                final = Array.from(new Set(run(0)));


            }
            resolve(final)



        });
    });
};

module.exports = async ({id_post,reaction,cookie,agent})=>{
    try {
        let result = [];

        let reaction_count = 0;
        let fb_dtsg = await fb_dtsg_ACTION({cookie, agent});
        if(fb_dtsg === false){
            throw {error:'400',result:[]}
        }
        let Num = await Num_Reaction({id_post, cookie, agent, fb_dtsg});
        switch (parseInt(reaction)) {
            case 1:
                reaction_count = Num.num_like;
                break;
            case 2:
                reaction_count = Num.num_heart;
                break;
            case 3:
                reaction_count = Num.num_lol;
                break;
            case 4:
                reaction_count = Num.num_surprise;
                break;
            default:
                throw 'Chỉ số cảm xúc không hợp lệ.Qúy khách vui lòng kiểm tra lại !';
        }
        let url_main = 'https://m.facebook.com/ufi/reaction/profile/browser/fetch/?limit=3000&reaction_type=' + reaction + '&total_count='+reaction_count+'&ft_ent_identifier=' + id_post;
        let arr_id_already = [];

        async function run(url){

            let Reaction_Action = await Reaction_Int({url, id_post, cookie, agent, fb_dtsg});
            result = result.concat(Reaction_Action);
            if(Reaction_Action.length>0){
                let listID = Reaction_Action.map(e=>e);
                arr_id_already = arr_id_already.concat(listID);
                url = 'https://m.facebook.com/ufi/reaction/profile/browser/fetch/?limit=3000&reaction_type=' + reaction + '&shown_ids='+arr_id_already.join('%2C')+'&total_count='+reaction_count+'&ft_ent_identifier=' + id_post;

                return await run(url)
            }else {

                return result
            }

        }
        return await run(url_main)


    }catch (e) {
        return e
    }
};