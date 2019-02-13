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

let infoAction = ({id,cookie,agent})=>{
    return new Promise(resolve=> {
        let option = {
            method: 'get',
            url: 'https://facebook.com/'+id,
            headers: {
                "User-Agent": agent,
                "Cookie":cookie,
            },

        };
        request(option, function (err, res, body) {
            let $ = cheerio.load(body);
            if(body.includes('https://www.facebook.com/login')){
                resolve(false)
            }else {
                let data = {
                    id:id,
                    name:$("title#pageTitle").text()
                };
                resolve(data)
            }
        });
    });
};




module.exports = async ({cookie,agent})=>{
    let id = FINDid(cookie, "c_user=", ";");
    let info = await infoAction({id,cookie,agent});
    if(info === false){
        return {error:'400',result:[]}
    }else {
        return info;
    }
};