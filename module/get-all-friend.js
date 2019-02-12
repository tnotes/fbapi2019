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
                resolve(FINDid(body, 'name="fb_dtsg" value="', '"'))
            }
        });
    })
};

let Friends = ({url,cookie,agent,fb_dtsg})=>{
    return new Promise(resolve=> {
        let option = {
            method: 'post',
            url: url,
            headers: {
                "User-Agent": agent,
                "Cookie":cookie,
            },
            form: {
                "__user": FINDid(cookie, "c_user=", ";"),
                "fb_dtsg": fb_dtsg
            }

        };
        request(option, function (err, res, body) {
            let $ = cheerio.load(body);
            let result = [];
            $("div._55x2").find("div._5pxa").each(function () {
                let name = $(this).find("h3").text();
                let id = FINDid($(this).find( "a[data-sigil*='touchable m-add-friend']" ).attr('href'),'add_friend.php?id=','&');
                result.push({ten_facebook:name,id_facebook:id})

            });

            let link_next = FINDid(body,'id:"m_more_friends",href:"','"');
            if(link_next.includes('unit_cursor') === false){
                link_next = undefined;
            }
            resolve({list_friend:result,link_next:link_next})
        });
    });
};
module.exports = {Friends,fb_dtsg_ACTION};