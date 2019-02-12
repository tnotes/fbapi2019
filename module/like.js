const request = require('request');
const cheerio = require('cheerio');

let FINDid = (text,startS,lastS)=>{
    let start = text.indexOf(startS) + startS.length;
    let last = text.indexOf(lastS,start);
    let sub = text.substring(
        start,last
    );
    return sub;
};

let fb_dtsg_ACTION = ({url,cookie,agent})=>{
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
            if(body.includes('https://www.facebook.com/login')){
                resolve(false)
            }else {
                resolve(FINDid(body, 'name="fb_dtsg" value="', '"'))
            }
        });
    });
};

let comment_post = ({id_post,reaction,cookie,agent,fb_dtsg})=>{
    return new Promise(resolve=> {
        let option = {
            method: 'post',
            url: 'https://m.facebook.com/ufi/reaction/?ft_ent_identifier='+id_post+'&story_render_location=permalink&feedback_source=8&is_sponsored=0&ext=1547219549&hash=AeS5yGEvYwo2dmJU&refid=18&__tn__=%3E*W-R&av='+FINDid(cookie, "c_user=", ";")+'&client_id=1546960610361%3A1352438032&session_id=e366acd1-6853-448f-9601-c5fcc0d9d4c5',
            headers: {
                "User-Agent": agent,
                "Cookie":cookie,

            },
            form:{

                "__user": FINDid(cookie, "c_user=", ";"),
                "fb_dtsg":fb_dtsg,
                reaction_type: reaction

            }
        };
        request(option, function (err, res, body) {
            let $ = cheerio.load(body);
            if($("span.mfsm").html() === '&#x110;&#xE3; x&#x1EA3;y ra l&#x1ED7;i'){
                resolve({error:"Đã xảy ra lỗi",id_post:id_post})
            }else {
                resolve({error:null,id_post:id_post})
            }
        });
    });
};



module.exports = async ({id_post,reaction,cookie,agent})=>{
    // reaction : 1,2,3,4
    let url = 'https://m.facebook.com/'+id_post;
    let fb_dtsg = await fb_dtsg_ACTION({url,cookie,agent});
    if(fb_dtsg === false){
        return {error:'400',result:[]}
    }else {
        let comment = await comment_post({id_post,reaction,cookie,agent,fb_dtsg})
        return comment;
    }




};