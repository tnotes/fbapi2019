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
let fb_dtsg_ag_ACTION = ({cookie,agent})=>{
    return new Promise(resolve => {
        let option = {
            method:'get',
            url:'https://www.facebook.com/groups/?category=groups',
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
                resolve(FINDid(body,'"async_get_token":"','"'))

            }
        });
    })
};

let ListJoinGroupFacebook = ({url,cookie,agent,fb_dtsg_ag})=>{
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

            if(url === 'https://www.facebook.com/groups/?category=groups'){
                let $ = cheerio.load(body);
                let result = [];



                $("div#GroupDiscoverCard_membership").find('a[data-hovercard*="ajax/hovercard"]').each(function () {
                    let nameGroup = $(this).text();
                    let id = FINDid($(this).attr('data-hovercard'),'group.php?id=','&');
                    result.push({id_nhom:id,ten_nhom:nameGroup})
                });
                let more = FINDid(body,'id="group-discover-card-see-moremembership"><div><a href="','"');

                let link_nex = 'https://www.facebook.com'+more+'&fb_dtsg_ag='+fb_dtsg_ag.replace(':','%3A')+'&__user='+FINDid(cookie, "c_user=", ";")+'&__a=1';
                return resolve({list_join_group:result,link_next:link_nex.replace(/amp;/g,'')})

            }else {
                let result = [];

                body = body.replace('for (;;);','');
                if(JSON.parse(body)["domops"][1] === undefined){

                    return resolve({list_join_group:result,link_next:undefined})
                }else {
                    let need1 = JSON.parse(body)["domops"][0][3]['__html'];
                    let need2 = JSON.parse(body)["domops"][1][3]['__html'];

                    let $ = cheerio.load(need1);
                    $("li").each(function () {
                        let nameGroup = $(this).find('a[data-hovercard*="hovercard"]').text();
                        let id = FINDid($(this).find('a[data-hovercard*="hovercard"]').attr('data-hovercard'),'group.php?id=','&');
                        result.push({id_nhom:id,ten_nhom:nameGroup})
                    });
                     $ = cheerio.load(need2);
                    $("li").each(function () {
                        let nameGroup = $(this).find('a[data-hovercard*="hovercard"]').text();
                        let id = FINDid($(this).find('a[data-hovercard*="hovercard"]').attr('data-hovercard'),'group.php?id=','&');
                        result.push({id_nhom:id,ten_nhom:nameGroup})
                    });
                    if(JSON.parse(body)["domops"][2][3] === null){
                        return resolve({list_join_group:result,link_next:undefined})

                    }
                    let need3 = JSON.parse(body)["domops"][2][3]['__html'];
                    $ = cheerio.load(need3);

                    let link_next = 'https://www.facebook.com'+$("a").attr('href')+'&fb_dtsg_ag='+fb_dtsg_ag+'&__user='+FINDid(cookie, "c_user=", ";")+'&__a=1';


                    return resolve({list_join_group:result,link_next:link_next})

                }

            }

        });
    });
};
module.exports = async ({cookie,agent})=>{
    let result = [];

    let url = 'https://www.facebook.com/groups/?category=groups';
    let fb_dtsg_ag = await fb_dtsg_ag_ACTION({cookie,agent});
    if (fb_dtsg_ag === false){
        return {error:'400',result:[]}
    }else {
        let getGroups = async ({url,cookie,agent,fb_dtsg_ag})=>{

            let data = await ListJoinGroupFacebook({url,cookie,agent,fb_dtsg_ag});
            result = result.concat(data.list_join_group);
            if(data.link_next !== undefined){
                url = data.link_next;

                return await getGroups({url,cookie,agent,fb_dtsg_ag})

            }else {
                return result
            }
        };
        return await getGroups({url,cookie,agent,fb_dtsg_ag});

    }



};