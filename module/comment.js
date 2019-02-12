const request = require('request');

let FINDid = (text,startS,lastS)=>{
    let start = text.indexOf(startS) + startS.length;
    let last = text.indexOf(lastS,start);
    let sub = text.substring(
        start,last
    );
    return sub;
};

let getID_post = ({url,cookie,agent})=>{
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

let comment_post = ({id_post,cookie,agent,fb_dtsg,text})=>{
    let id_victim = null;
    return new Promise(resolve=> {
        let option = {
            method: 'post',
            url: 'https://m.facebook.com/a/comment.php?fs=8&fr=%2Fprofile.php&actionsource=2&comment_logging&ft_ent_identifier='+id_post+'&eav=AfacLYAP0k1six9zJroqLa4Tk97_dymvMLjSw0dXrzvH5Qsd_2OiS_Ngu3oHxLafhAM&av='+FINDid(cookie, "c_user=", ";")+'&gfid=AQAySTVc3k2sWDGZ&_ft_=mf_story_key.'+id_post+'%3Atop_level_post_id.'+id_post+'%3Atl_objid.'+id_post+'%3Acontent_owner_id_new.'+id_victim+'%3Athrowback_story_fbid.'+id_post+'%3Astory_location.4%3Astory_attachment_style.share%3Athid.'+id_victim+'&refid=52',
            headers: {
                "User-Agent": agent,
                "Cookie":cookie,

            },
            form:{

                "__user": FINDid(cookie, "c_user=", ";"),
                "comment_text": text,
                "fb_dtsg":fb_dtsg,

            }
        };
        request(option, function (err, res, body) {

            if(body.includes('_55wr acr apm abb')){
                resolve({error:"400",id_post:id_post})
            }else {
                resolve({error:null,id_post:id_post})
            }
        });
    });
};



module.exports = async ({id_post,cookie,agent,text})=>{

    let url = 'https://m.facebook.com/'+id_post;
    let fb_dtsg = await getID_post({url,cookie,agent});
    if(fb_dtsg === false){
        return {error:'400',result:[]}
    }else {
        let comment = await comment_post({id_post,cookie,agent,fb_dtsg,text})
        return comment;
    }





};