const request = require('request');
(async ()=>{
    let option = {
        method:'post',
        url:'http://localhost:9191/api/post',
        form:{
            '0':JSON.stringify({
                cookie:'sb=5wxhXJUWU805JNGYsUdN3gU4; datr=5wxhXB9wL1QPdjoqH3SbXZhl; wd=1366x625; locale=en_US; c_user=100032749252193; xs=7%3AcMzQAQ-ryUg7QQ%3A2%3A1550214014%3A1178%3A9935; fr=1OHoglbWHfkSKjbxC.AWWk7Xc_BSPh7JcXVPFSuN69MxM.BcYQzn.j4.AAA.0.0.BcZmN-.AWUWZzek; pl=n; spin=r.4768464_b.trunk_t.1550214014_s.1_v.2_; ',
                agent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36',
                type:'timeline',
                content:'asdfdf',
                ImageArr: [],
                color:null,
                postLink:'https://www.facebook.com/NguyenHuyLamMKT/posts/1194583890698273?commentid=332323',
                youtubeLink:null,
                group: null,
                page: null
            }),
        }
    };
    const buffer = request(option);
    buffer.on('data',chunked=>console.log(chunked.toString()))
})();