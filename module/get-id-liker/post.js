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
            let $ = cheerio.load(body)

            let num_like = body.indexOf('reaction_type=1&total_count=') > 0 ? FINDid(body,'reaction_type=1&total_count=','&'): 0;
            let num_heart = body.indexOf('reaction_type=2&total_count=') > 0 ? FINDid(body,'reaction_type=2&total_count=','&'): 0;
            let num_lol = body.indexOf('reaction_type=3&total_count=') > 0 ? FINDid(body,'reaction_type=3&total_count=','&'): 0;
            let num_surprise = body.indexOf('reaction_type=4&total_count=') > 0 ? FINDid(body,'reaction_type=4&total_count=','&'):0;
            if(num_like === 0 && num_heart === 0 && num_lol === 0 && num_surprise === 0){
                num_like = $('span[data-sigil="reaction_profile_tab_count"]').text();
            }
            resolve({num_like,num_heart,num_lol,num_surprise})

        });
    });
};
let getNameThroughtId = ({id,cookie})=>{
    return new Promise(resolve=>{
        let option = {
            method: 'get',
            url:'https://m.facebook.com/'+id,
            headers: {
                "Cookie":cookie,
                "User-Agent": 'Nokia6630/1.0 (2.3.129) SymbianOS/8.0 Series60/2.6 Profile/MIDP-2.0 Configuration/CLDC-1.1',
            },

        };
        request(option, async function (err, res, body) {

            let $ = cheerio.load(body);
            let name = $('div#root').find("strong").eq(0).text();
            return resolve({name,id})
        });
    })
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
            if(body.includes('html>')){
                return resolve(final)
            }
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

            let finalMap = final.map(e=>getNameThroughtId({id:e,cookie:cookie}));
            final = await Promise.all(finalMap);

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
        console.log(Num)
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
            if(Reaction_Action.length>0 && arr_id_already.length < Num){
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