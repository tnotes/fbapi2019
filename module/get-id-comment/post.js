const request = require('request');

let FINDnum = (text,startS,lastS)=>{
    let last = text.indexOf(lastS);
    let start = text.lastIndexOf(startS,last) + startS.length;
    let sub = text.substring(
        start,last
    );
    return sub;
};

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
                return resolve(false)
            }else{
                let fb_dtsg_value = FINDid(body,'name="fb_dtsg" value="','"');
                let ft_ent_identifier_value = 0;
                if(body.includes('name="ft_ent_identifier" value="')){
                    ft_ent_identifier_value = FINDid(body,'name="ft_ent_identifier" value="','"');
                }else if(body.includes('ft_ent_identifier=')){
                    let ft_ent_identifier_value = FINDid(body,'ft_ent_identifier=','&');

                }
                return resolve({fb_dtsg_value,ft_ent_identifier_value})
            }
        });
    });
};
let Num_Comment = ({id,ft_ent_identifier,reaction,cookie,agent})=>{
    return new Promise(resolve=> {
        let option = {
            method: 'get',
            url: 'https://www.facebook.com/'+id,
            headers: {
                "User-Agent": agent,
                "Cookie":cookie,

            }
        };
        request(option, function (err, res, body) {
            let num = 0;
            if(body.includes('"commentstargetfbid":"')){

                let textNum = FINDnum(body,'"commentcount":','"commentstargetfbid":"'+ft_ent_identifier+'"');

                num = parseInt(FINDid(textNum,'',','))

            }else if(body.includes('commentcount:')){
                num = parseInt(FINDid(body,'commentcount:',','))
            }else if(body.includes('display_comments_count:{count:')){

                num = parseInt(FINDid(body,'display_comments_count:{count:','}'));
            }
           resolve(num)

        });
    });
};

let getIDcomment = ({id,num,cookie,agent,fb_dtsg,ft_ent_identifier})=>{
    return new Promise(resolve=> {
        let option = {
            method: 'post',
            url: 'https://www.facebook.com/ajax/ufi/comment_fetch.php',
            headers: {
                "User-Agent": agent,
                "Cookie":cookie,

            },
            form:{
                'ft_ent_identifier':ft_ent_identifier,
                'offset':num,
                'length':'50',
                '__user':FINDid(cookie, "c_user=", ";"),
                '__a':'1',
                'fb_dtsg':fb_dtsg,


            }
        };
        if(num < 50){
            option.form.offset = 0;
        }
        request(option, function (err, res, body) {
            body = body.replace('for (;;);','');
            let jsonBody = JSON.parse(body);
            let user_comment = Object.values(jsonBody.jsmods.require[0][3][1].profiles).map(e=>{
                return {
                    id:e.id,
                    name:e.name,
                    gender: e.gender,
                    is_friend:e.is_friend

                }
            });
            resolve(user_comment)

        });
    });
};



module.exports = async ({id,cookie,agent})=>{
    let url = 'https://facebook.com/'+id;
    let result = [];
    let fb_dtsg_ALL = await fb_dtsg_ACTION({url,cookie,agent});
    if(fb_dtsg_ALL === false){
        return {error:'Cookie hết hạn'}
    }
    let fb_dtsg = fb_dtsg_ALL.fb_dtsg_value;
    let ft_ent_identifier = fb_dtsg_ALL.ft_ent_identifier_value;
    let nump = await Num_Comment({id,ft_ent_identifier,cookie,agent,fb_dtsg});
    async function run (num){
        if(num < 50 ) {
            let join = await getIDcomment({id,num,cookie,agent,fb_dtsg,ft_ent_identifier});
            result = result.concat(join);
            return result
        }else {
            num = num - 50;
            let join = await getIDcomment({id,num,cookie,agent,fb_dtsg,ft_ent_identifier});
            result = result.concat(join);
            return await run(num);
        }

    }

    if(nump < 50){
        let join = await getIDcomment({id,num:nump,cookie,agent,fb_dtsg,ft_ent_identifier});
        return join
    }else {

        return await run(nump)

    }


};