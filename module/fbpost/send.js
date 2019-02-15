module.exports = function (location, id, content, color, photoID,postLinkFaceObj, youtubeObj) {

    let obj = {
        "client_mutation_id": "72e472fc-e001-4197-899c-21f0abf0ed6d",
        "actor_id": id,
        "input": {
            "actor_id": id,
            "client_mutation_id": "3c287f13-967e-4c34-b45f-9548154c8ca1",
            "source": "WWW",
            "audience": {"web_privacyx": 300645083384735},
            "message": {"text": content, "ranges": []},
            "with_tags_ids": [],
            "multilingual_translations": [],
            "camera_post_context": {"deduplication_id": "f3fd61a5-0247-4056-8b4d-900686c5808a", "source": "composer"},
            "composer_entry_time": 87,
            "composer_session_events_log": {"composition_duration": 12},
            "direct_share_status": "NOT_SHARED",
            "sponsor_relationship": "WITH",
            "web_graphml_migration_params": {
                "is_also_posting_video_to_feed": false,
                "target_type": "feed",
                "xhpc_composerid": "rc.js_1k1",
                "xhpc_context": "profile",
                "xhpc_publish_type": "FEED_INSERT",
                "xhpc_timeline": true,
                "waterfall_id": "f3fd61a5-0247-4056-8b4d-900686c5808a"
            },

        }
    };
    if (location.timeline !== null) {
        obj["input"]["audience"] = {"web_privacyx": 300645083384735}
    } else if (location.group !== null) {

        obj["input"]["audience"] = {"to_id": location.group.id}
    }else if(location.page !== null){
        obj["input"]["actor_id"] = location.page.id;
        obj["input"]["audience"] = {"privacy": {"base_state": "EVERYONE"}}

    }

    if (youtubeObj !== null) {
        obj["input"]["attachments"] = [{"link": {"share_scrape_data": "{'share_type':100,'share_params':{'urlInfo':{'canonical':'" + youtubeObj.link + "','final':'" + youtubeObj.link + "','user':'" + youtubeObj.link + "'},'favicon':'https://www.youtube.com/yts/img/favicon_144-vfliLAfaB.png','external_author_id':'" + youtubeObj.external_author_id + "','iframe':[],'title':'" + youtubeObj.title + "','summary':'" + youtubeObj.content + "','images_sorted_by_dom':[],'ranked_images':{'images':" + youtubeObj.images + ",'ranking_model_version':11,'specified_og':true},'medium':103,'url':'" + youtubeObj.link + "','global_share_id':" + youtubeObj.global_share_id + ",'video':[{'type':'text/html','secure_url':'" + youtubeObj.secure_url + "','width':1280,'height':720,'src':'" + youtubeObj.link + "'},{'type':'application/x-shockwave-flash','secure_url':'" + youtubeObj.secure_url + "','width':1280,'height':720,'src':'" + youtubeObj.link + "'}],'music':[],'asset_3d_infos':[],'extra':[],'amp_url':'','url_scrape_id':'" + youtubeObj.url_scrape_id + "','hmac':'" + youtubeObj.hmac + "','locale':null,'external_img':'{`src`:" + youtubeObj.images + ",`width`:1280,`height`:720}','images':" + youtubeObj.images + "},'shared_from_post_id':null}"}}]

    }
    if(Object.keys(postLinkFaceObj).length>0){
        if(postLinkFaceObj.share_type === 22){
             obj["input"]["attachments"] = [{"link":{"share_scrape_data":"{'share_type':"+postLinkFaceObj.share_type+",'share_params':["+id+","+postLinkFaceObj.postID+"],'shared_from_post_id':"+postLinkFaceObj.postID+"}"}}]

        }else if(postLinkFaceObj.share_type === 37){
            obj["input"]["attachments"] = [{"link":{"share_scrape_data":"{'share_type':"+postLinkFaceObj.share_type+",'share_params':['"+postLinkFaceObj.postID+"'],'shared_from_post_id':null}"}}]
        }else if(postLinkFaceObj.share_type === 2){
            obj["input"]["attachments"] = [{"link":{"share_scrape_data":"{'share_type':"+postLinkFaceObj.share_type+",'share_params':['"+postLinkFaceObj.postID+"'],'shared_from_post_id':null}"}}]

        }else if(postLinkFaceObj.share_type === 11){
            obj["input"]["attachments"] = [{"link":{"share_scrape_data":"{'share_type':"+postLinkFaceObj.share_type+",'share_params':['"+postLinkFaceObj.postID+"'],'shared_from_post_id':null}"}}]

        }
    }
    else if (photoID.length > 0) {
        obj["input"]["attachments"] = photoID.map(e => {
            return {"photo": {"id": e, "tags": []}}
        });
    }
    else if(color !== null){
        obj["input"]["text_format_preset_id"] = color;


    }
    return obj

};