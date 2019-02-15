const request = require('request');
(async ()=>{
    let option = {
        method:'post',
        url:'http://localhost:9191/api/get-id-liker-post',
        form:{
            '0':JSON.stringify({
                cookie:'sb=5wxhXJUWU805JNGYsUdN3gU4; datr=5wxhXB9wL1QPdjoqH3SbXZhl; m_pixel_ratio=1; x-referer=eyJyIjoiL2hvbWUucGhwIiwiaCI6Ii9ob21lLnBocCIsInMiOiJtIn0%3D; wd=1366x626; locale=vi_VN; c_user=100029354700276; xs=25%3Azq5i0OMEIinZlA%3A2%3A1550200714%3A8869%3A9935; fr=1OHoglbWHfkSKjbxC.AWUz83GzeQxaboM4gmY8f4vB-ck.BcYQzn.j4.AAA.0.0.BcZi-K.AWX-qysm; pl=n; spin=r.4767201_b.trunk_t.1550200715_s.1_v.2_; act=1550201166027%2F3; presence=EDvF3EtimeF1550201193EuserFA21B29354700276A2EstateFDt3F_5bDiFA2user_3a1B10760317952A2ErF1EoF3EfF7C_5dElm3FA2user_3a1B10760317952A2Eutc3F1550201128305G550201193625CEchFDp_5f1B29354700276F15CC;  ',
                agent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36',
                reaction:'1',
                id_post:'159923474996142'
            }),
        }
    };
    const buffer = request(option);
    buffer.on('data',chunked=>console.log(chunked.toString()))
})();