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

let fb_dtsg_ag_ACTION = ({url,cookie,agent})=>{
    return new Promise(resolve=> {
        let option = {
            method: 'get',
            url: 'https://facebook.com',
            headers: {
                "User-Agent": agent,
                "Cookie":cookie,
            },

        };
        request(option, function (err, res, body) {
            if(body.includes('https://www.facebook.com/login')){
                return resolve(false)
            }else {
                let fb_dtsg_ag_value = FINDid(body,'"async_get_token":"','"');
                return resolve({value:fb_dtsg_ag_value})
            }

        });
    });
};


let getIDgroup = ({url,cookie,agent})=>{
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
            let bodyJSON = body.replace('for (;;);','');

            body = JSON.parse(bodyJSON);
            if(body.domops === undefined){
                return resolve({result:[],cursor:undefined})
            }
            let html = body.domops[0][3]['__html'];
            let $ = cheerio.load(html);
            let result = [];
            $('div.fbProfileBrowserList').find("div._gse").each(function () {
                let textID = $(this).find('a[ajaxify*="/groups/member_bio"]').attr('ajaxify');
                if(textID !== undefined){
                    let id = FINDid(textID,'member_id=','&')
                    let name = $(this).find('div._60ri').find('a[ajaxify*="/groups/member_bio"]').text();
                    result.push({name,id})
                }
            });
            if(body.onload === undefined) {

                return resolve({result: [], cursor: undefined})
            }
            let cursor = FINDid(body.onload[0],'&cursor=','&');
            return resolve({result,cursor});


        });
    });
};



module.exports = async ({id,num,cookie,agent})=>{

    let result = [];
    let fb_dtsg_ALL = await fb_dtsg_ag_ACTION({cookie,agent});
    if(fb_dtsg_ALL === false){
        return {error:'400'}
    }else {
        async function run (cursor){
            if(cursor === undefined){
                return result
            }
            let url = 'https://www.facebook.com/ajax/browser/list/group_confirmed_members/?gid='+id+'&order=date&view=list&limit=500&sectiontype=recently_joined&cursor='+cursor+'&start=0&av='+FINDid(cookie, "c_user=", ";")+'&fb_dtsg_ag='+fb_dtsg_ALL.value+'&__user='+FINDid(cookie, "c_user=", ";")+'&__a=1';
            let data = await getIDgroup({url,cookie,agent});
            result = result.concat(data.result);
            if(result.length >= num){
                result = result.slice(0,num)
                return result
            }

            return await run(data.cursor)

        }
        return run('');
    }




};