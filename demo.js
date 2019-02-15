const request = require('request');
(async ()=>{
    let option = {
        method:'post',
        url:'http://localhost:9191/api/post',
        form:{
            '0':JSON.stringify({
                cookie:'dbln=%7B%22100032749252193%22%3A%22t5zdLyUc%22%7D; sb=5wxhXJUWU805JNGYsUdN3gU4; datr=5wxhXB9wL1QPdjoqH3SbXZhl; m_pixel_ratio=1; x-referer=eyJyIjoiL2hvbWUucGhwIiwiaCI6Ii9ob21lLnBocCIsInMiOiJtIn0%3D; wd=1366x626; locale=en_US; c_user=100032749252193; xs=33%3A1ywWuNNjJPYeHA%3A2%3A1550199200%3A1178%3A9935; fr=1OHoglbWHfkSKjbxC.AWW3BlXlJ7dH3nnHcNB08Z5VcLk.BcYQzn.j4.AAA.0.0.BcZimg.AWUdecTQ; pl=n; act=1550199194694%2F2; spin=r.4767201_b.trunk_t.1550199201_s.1_v.2_; presence=EDvF3EtimeF1550199197EuserFA21B32749252193A2EstateFDutF1550199197400CEchFDp_5f1B32749252193F2CC; ',
                agent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36',
                type:'timeline',
                content:'asdfdf',
                ImageArr: [],
                color:null,
                postLink:'https://www.facebook.com/TruongAction/videos/2985108858181534/',
                youtubeLink:null,
                group: null,
                page: null
            }),
        }
    };
    const buffer = request(option);
    buffer.on('data',chunked=>console.log(chunked.toString()))
})();