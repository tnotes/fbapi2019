const request = require('request');
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

let addFriend = ({id,reaction,cookie,agent,fb_dtsg})=>{
    return new Promise(resolve=> {
        let option = {
            method: 'post',
            url: 'https://m.facebook.com/a/mobile/friends/profile_add_friend.php?subjectid='+id+'&istimeline=1&hf=profile_button&fref=pb',
            headers: {
                "User-Agent": agent,
                "Cookie":cookie,

            },
            form:{

                "__user": FINDid(cookie, "c_user=", ";"),
                "fb_dtsg":fb_dtsg,

            }
        };
        request(option, function (err, res, body) {
            resolve({error:null,id:id})
        });
    });
};



module.exports = async ({id,cookie,agent})=>{
    let url = 'https://m.facebook.com/';
    let fb_dtsg = await fb_dtsg_ACTION({url,cookie,agent});
    if(fb_dtsg === false){
        return {error:'400',result:[]}
    }else {
        let add = await addFriend({id,cookie,agent,fb_dtsg})
        return add;

    }




};