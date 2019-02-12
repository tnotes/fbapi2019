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

let ListPost = ({url, cookie, agent,fb_dtsg})=>{
    return new Promise(resolve=> {
        let option = {
            method: 'post',
            url: url,
            headers: {
                'User-Agent': agent,
                'Cookie': cookie,
                'Accept': '/',

            },
            form: {

                "__user": FINDid(cookie, "c_user=", ";"),
                "fb_dtsg": fb_dtsg

            }

        };
        request(option, function (err, res, body) {
            let $ = cheerio.load(body);
            let result = [];
            $("div.bs").find("div.bu").each(function () {
                let message = $(this).find( "div[data-ft*='{\"tn\":\"*s\"}']" ).text();
                let id = 0;

                let textID = $(this).find( "a[href*='&id=']" ).attr('href');
                if (textID !== undefined){
                    id = FINDid(textID, '&id=', '&');

                    if(textID.includes('story_fbid=') === true){
                        id = FINDid(textID, 'story_fbid=', '&');
                    }
                    if(textID.includes('?fbid=')){
                        id = FINDid(textID, '?fbid=', '&');
                    }

                }



                let num_comment = $(this).find(`div[data-ft='{"tn":"*W"}']`).find( "a" ).eq(3).text().replace(/[^0-9]/g, '');
                let num_like = $(this).find(`div[data-ft='{"tn":"*W"}']`).find( "a" ).eq(0).text().replace(/[^0-9]/g, '') || '0';
                let time = $(this).find('abbr').text();




                result.push({
                    id_cua_bai_post: id,
                    so_luong_like: num_like,
                    so_luong_binh_luan: num_comment,
                    noi_dung: message,
                    thoi_gian: time
                })

            });
            let link_next = $("div#see_more_pager").find("a").attr("href");
            resolve({list_post:result,link_next:link_next})



        });
    });
};
module.exports = async ({keyword,num_post_require,cookie,agent})=>{
    let url = "https://m.facebook.com/graphsearch/str/"+encodeURI(keyword)+"/stories-keyword/stories-feed?tsid&source=pivot&pn=5";
    let result = [];
    let fb_dtsg = await fb_dtsg_ACTION({cookie,agent});
    if(fb_dtsg === false){
        return {error:'400',result:[]}
    }else {
        for(let i = 1;i<=Math.ceil(num_post_require/12);i++) {

            let data = await ListPost({url, cookie, agent,fb_dtsg});
            url = data.link_next;
            if (i === Math.ceil(num_post_require / 12)) {

                let range =num_post_require - (12*(i-1));
                if(num_post_require < 12){
                    range = num_post_require
                }
                if (range > 0) {
                    result = result.concat(data.list_post.slice(0, range));
                } else {
                    result = result.concat(data.list_post);
                }
            } else {
                result = result.concat(data.list_post);
            }

        }

        return result;
    }

};