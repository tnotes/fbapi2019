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
let fb_dtsg_ag_ACTION = ({id_page,cookie,agent})=>{
    return new Promise(resolve => {
        let option = {
            method:'get',
            url:'https://www.facebook.com/search/'+id_page+'/likers?ref=about',
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
                let fb_dtsg_ag_value = FINDid(body, '"async_get_token":"', '"');
                let browse_sid = FINDid(body,'browse_sid:"','"');
                let encoded_title = FINDid(body,'encoded_title:"','"');
                let impression_id = FINDid(body,'impression_id:"','"');
                let filter_ids = '';
                let cursor = FINDid(body,'cursor:"','"');
                let page_number = FINDid(body,'page_number:',',');
                let browse_serp = FINDid(body,'"browse_serp:','"');


                resolve({value:fb_dtsg_ag_value,browse_sid:browse_sid,encoded_title:encoded_title,impression_id:impression_id,filter_ids:filter_ids,cursor:cursor,page_number:page_number,browse_serp:browse_serp})
            }
        });
    })
};

let Liker = ({url,cookie,agent})=>{
    return new Promise(resolve=> {
        let option = {
            method: 'get',
            url:url,

            headers: {
                'cookie':cookie,
                'user-agent':agent,


            },

        };
        request(option, async  function (err, res, body) {
            let result = [];
            body = body.replace('for (;;);','');
            if(body.includes('something went wrong')){

                return resolve(undefined)

            }
            body = JSON.parse(body);


            let $ = cheerio.load(body.payload);
            $('div[data-testid="results"]').find('div._4p2o').each(function () {
                let textID = $(this).find('div[data-bt*="id"]').attr('data-bt');
                let id = FINDid(textID,'"id":',',');
                let name = $(this).find('a._32mo').text();
                result.push({id:id,name:name});
            });
            let cursor = body.jsmods.require[1][3][0].cursor;
            let page_number = body.jsmods.require[1][3][0].page_number;
            return resolve({list_liker:result,cursor,page_number})
        });
    });
};
module.exports = async ({id_page,limit,cookie,agent})=>{
    let result = [];
    let fb_dtsg_ag = await fb_dtsg_ag_ACTION({id_page,cookie,agent});

    let url = null;
    if(fb_dtsg_ag === false){
        return {error:'Cookie hết hạn',result:[]}
    }else {
        limit = parseInt(limit);
        let resultAction = async (data,limit)=>{
            if(data === undefined){
                return result
            }

            if(result.length === 0){
                url =  'https://www.facebook.com/ajax/pagelet/generic.php/BrowseScrollingSetPagelet?fb_dtsg_ag='+fb_dtsg_ag.value+'&data=%7B%22view%22%3A%22list%22%2C%22encoded_query%22%3A%22%7B%5C%22bqf%5C%22%3A%5C%22likers('+id_page+')%5C%22%2C%5C%22browse_sid%5C%22%3A%5C%22'+fb_dtsg_ag.browse_sid+'%5C%22%2C%5C%22typeahead_sid%5C%22%3Anull%2C%5C%22vertical%5C%22%3A%5C%22none%5C%22%2C%5C%22post_search_vertical%5C%22%3Anull%2C%5C%22intent_data%5C%22%3Anull%2C%5C%22requestParams%5C%22%3A[]%2C%5C%22has_chrono_sort%5C%22%3Afalse%2C%5C%22query_analysis%5C%22%3Anull%2C%5C%22subrequest_disabled%5C%22%3Afalse%2C%5C%22token_role%5C%22%3A%5C%22NONE%5C%22%2C%5C%22preloaded_story_ids%5C%22%3A[]%2C%5C%22extra_data%5C%22%3Anull%2C%5C%22disable_main_browse_unicorn%5C%22%3Afalse%2C%5C%22entry_point_scope%5C%22%3Anull%2C%5C%22entry_point_surface%5C%22%3Anull%2C%5C%22entry_point_action%5C%22%3Anull%2C%5C%22squashed_ent_ids%5C%22%3A[]%2C%5C%22source_session_id%5C%22%3Anull%2C%5C%22preloaded_entity_ids%5C%22%3A[]%2C%5C%22preloaded_entity_type%5C%22%3Anull%2C%5C%22block_preloaded_entity_ids_deduping%5C%22%3Afalse%2C%5C%22high_confidence_argument%5C%22%3Anull%2C%5C%22query_source%5C%22%3Anull%2C%5C%22logging_unit_id%5C%22%3A%5C%22browse_serp%3A'+fb_dtsg_ag.browse_serp+'%5C%22%2C%5C%22query_title%5C%22%3Anull%2C%5C%22serp_decider_outcome%5C%22%3Anull%7D%22%2C%22encoded_title%22%3A%22'+fb_dtsg_ag.encoded_title+'%22%2C%22ref%22%3A%22about%22%2C%22logger_source%22%3A%22www_main%22%2C%22typeahead_sid%22%3A%22%22%2C%22tl_log%22%3Afalse%2C%22impression_id%22%3A%22'+fb_dtsg_ag.impression_id+'%22%2C%22filter_ids%22%3A%7B'+fb_dtsg_ag.filter_ids+'%7D%2C%22experience_type%22%3A%22grammar%22%2C%22exclude_ids%22%3Anull%2C%22browse_location%22%3A%22browse_location%3Abrowse%22%2C%22trending_source%22%3Anull%2C%22reaction_surface%22%3Anull%2C%22reaction_session_id%22%3Anull%2C%22ref_path%22%3A%22%2Fsearch%2F'+id_page+'%2Flikers%22%2C%22is_trending%22%3Afalse%2C%22topic_id%22%3Anull%2C%22place_id%22%3Anull%2C%22story_id%22%3Anull%2C%22callsite%22%3A%22browse_ui%3Ainit_result_set%22%2C%22has_top_pagelet%22%3Atrue%2C%22display_params%22%3A%7B%22crct%22%3A%22none%22%7D%2C%22cursor%22%3A%22'+fb_dtsg_ag.cursor+'%22%2C%22page_number%22%3A'+fb_dtsg_ag.page_number+'%2C%22em%22%3Afalse%2C%22tr%22%3Anull%7D&__user='+FINDid(cookie, "c_user=", ";")+'&__a=1';
            }else {
                url = 'https://www.facebook.com/ajax/pagelet/generic.php/BrowseScrollingSetPagelet?fb_dtsg_ag='+fb_dtsg_ag.value+'&data=%7B%22view%22%3A%22list%22%2C%22encoded_query%22%3A%22%7B%5C%22bqf%5C%22%3A%5C%22likers('+id_page+')%5C%22%2C%5C%22browse_sid%5C%22%3A%5C%22'+fb_dtsg_ag.browse_sid+'%5C%22%2C%5C%22typeahead_sid%5C%22%3Anull%2C%5C%22vertical%5C%22%3A%5C%22none%5C%22%2C%5C%22post_search_vertical%5C%22%3Anull%2C%5C%22intent_data%5C%22%3Anull%2C%5C%22requestParams%5C%22%3A[]%2C%5C%22has_chrono_sort%5C%22%3Afalse%2C%5C%22query_analysis%5C%22%3Anull%2C%5C%22subrequest_disabled%5C%22%3Afalse%2C%5C%22token_role%5C%22%3A%5C%22NONE%5C%22%2C%5C%22preloaded_story_ids%5C%22%3A[]%2C%5C%22extra_data%5C%22%3Anull%2C%5C%22disable_main_browse_unicorn%5C%22%3Afalse%2C%5C%22entry_point_scope%5C%22%3Anull%2C%5C%22entry_point_surface%5C%22%3Anull%2C%5C%22entry_point_action%5C%22%3Anull%2C%5C%22squashed_ent_ids%5C%22%3A[]%2C%5C%22source_session_id%5C%22%3Anull%2C%5C%22preloaded_entity_ids%5C%22%3A[]%2C%5C%22preloaded_entity_type%5C%22%3Anull%2C%5C%22block_preloaded_entity_ids_deduping%5C%22%3Afalse%2C%5C%22high_confidence_argument%5C%22%3Anull%2C%5C%22query_source%5C%22%3Anull%2C%5C%22logging_unit_id%5C%22%3A%5C%22browse_serp%3A'+fb_dtsg_ag.browse_serp+'%5C%22%2C%5C%22query_title%5C%22%3Anull%2C%5C%22serp_decider_outcome%5C%22%3Anull%7D%22%2C%22encoded_title%22%3A%22'+fb_dtsg_ag.encoded_title+'%22%2C%22ref%22%3A%22about%22%2C%22logger_source%22%3A%22www_main%22%2C%22typeahead_sid%22%3A%22%22%2C%22tl_log%22%3Afalse%2C%22impression_id%22%3A%22'+fb_dtsg_ag.impression_id+'%22%2C%22filter_ids%22%3A%7B'+fb_dtsg_ag.filter_ids+'%7D%2C%22experience_type%22%3A%22grammar%22%2C%22exclude_ids%22%3Anull%2C%22browse_location%22%3A%22browse_location%3Abrowse%22%2C%22trending_source%22%3Anull%2C%22reaction_surface%22%3Anull%2C%22reaction_session_id%22%3Anull%2C%22ref_path%22%3A%22%2Fsearch%2F'+id_page+'%2Flikers%22%2C%22is_trending%22%3Afalse%2C%22topic_id%22%3Anull%2C%22place_id%22%3Anull%2C%22story_id%22%3Anull%2C%22callsite%22%3A%22browse_ui%3Ainit_result_set%22%2C%22has_top_pagelet%22%3Atrue%2C%22display_params%22%3A%7B%22crct%22%3A%22none%22%7D%2C%22cursor%22%3A%22'+data.cursor+'%22%2C%22page_number%22%3A'+data.page_number+'%2C%22em%22%3Afalse%2C%22tr%22%3Anull%7D&__user='+FINDid(cookie, "c_user=", ";")+'&__a=1';
            }

            data = await Liker({url, cookie, agent});
            if(data === undefined){
                return result
            }
            result = result.concat(data.list_liker);
            if(result.length >= limit){
                result = result.slice(0,limit);
                return result;
            }
            return await resultAction(data,limit);
        };
        return await resultAction({},limit)
    }










};