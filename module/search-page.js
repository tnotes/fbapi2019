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

let ListPage = ({url,cookie,agent,fb_dtsg})=>{
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
            if(body === undefined){
                resolve({list_page:[],link_next:undefined})

            }else {
                let $ = cheerio.load(body);
                let result = [];



                $("div#BrowseResultsContainer").find("div.bx").each(function () {
                    let id = FINDid($(this).find( "a[href*='result_id']" ).attr('href'),'result_id%22%3A','%');
                    let name = $(this).find("div.cf").text().trim();
                    let num_like = $(this).find( "div.cl" ).text().replace(/[^0-9]/g, '');
                    let image = $(this).find("img").attr('src');
                    result.push({id_cua_page:id,ten_cua_page:name,so_luong_like:num_like,hinh_anh_page:image})

                });
                let link_next = $("div#see_more_pager").find("a").attr("href");
                resolve({list_page:result,link_next:link_next})

            }




        });
    });
};
module.exports = async ({keyword,num_page_require,cookie,agent})=>{
    let url = "https://m.facebook.com/search/pages/?q="+encodeURI(keyword)+"&source=filter&isTrending=0";
    let result = [];
    let fb_dtsg = await fb_dtsg_ACTION({cookie,agent});
    if(fb_dtsg === false){
        return {error:'400',result:[]}
    }else {
        for(let i = 1;i<=Math.ceil(num_page_require/12);i++) {

            let data = await ListPage({url, cookie, agent,fb_dtsg});
            url = data.link_next;
            if(url === undefined){
                break;
            }
            if (i === Math.ceil(num_page_require / 12)) {

                let range =num_page_require - (12*(i-1));
                if(num_page_require < 12){
                    range = num_page_require
                }
                if (range > 0) {
                    result = result.concat(data.list_page.slice(0, range));
                } else {
                    result = result.concat(data.list_page);
                }
            } else {
                result = result.concat(data.list_page);
            }

        }

        return result;
    }


};