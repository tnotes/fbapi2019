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


let getPage = ({url,cookie,agent})=>{
    return new Promise(resolve=> {
        let option = {
            method: 'get',
            url:'https://www.facebook.com/bookmarks/pages',
            headers: {
                "User-Agent": agent,
                "Cookie":cookie,
            }

        };
        request(option, function (err, res, body) {

            let $ = cheerio.load(body);
            let result = [];
            if(body.includes('https://www.facebook.com/login')){
                resolve({error:'400',result:result})
            }else {
                let text = FINDid($("script:contains('BookmarkSeeAllEntsSectionController')").contents()['0'].data,'BookmarkSeeAllEntsSectionController','}]');


                function find(content,pos) {
                    let start = content.indexOf('id:"',pos);
                    if(start > 0){
                        let end = content.indexOf(',count:',start);
                        let text = content.slice(start,end);
                        let id = text.split(',')[0].replace('id:"','').replace('"','');
                        let name = text.split(',')[1].replace('name:"','').replace('"','');
                        result.push({id:id,name:name});
                        return find(content,end);

                    }else {
                        return(result)
                    }
                }

                resolve({error:null,result:find(text,0)})
            }
        });
    });
};
module.exports = async ({cookie,agent})=>{
    let data = await getPage({cookie,agent});
   return data




};
