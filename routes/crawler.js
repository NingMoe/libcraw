
var request = require('request');
var querystring = require('querystring');
var cheerio = require('cheerio');

var crawler = function(msgContent){
    var queryContents =  {
        searchtype:'X',
        SORT:'D',
        searcharg:msgContent
    };


    var url =  "https://library.must.edu.mo/search/?"+querystring.stringify(queryContents);


    console.log(url);

    var resMsgContent = "";
    request(url,callback);

    function callback(err,res,body){

        if(!err && res.statusCode == 200){
            var $ = cheerio.load(body,{normalizeWhitespace: true});
            //$('.briefcitDetail').each(function(){
            //    console.log($(this).find('.briefcitDetailMain').html().split('<br>')[2]);
            //})
            var bookitems = [];
            console.log("hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh");
            $(".briefcitDetail").each(function(){
                var bookItem = {
                    title:'',
                    author:'',
                    public:'',
                    copies:[]
                };

                bookItem.title = $(this).find('.briefcitTitle a').text();
                bookItem.author = $(this).find('.briefcitDetailMain').html().split('<br>')[1];

                bookItem.public = $(this).find('.briefcitDetailMain').html().split('<br>')[2];

                var copies = $(this).find('.bibItemsEntry').each(function(){

                    var bookCopy = {
                        location:'',
                        callNo:'',
                        status:''
                    };

                    var bookcopyitem = $(this).find('td');

                    bookCopy.location = bookcopyitem.eq(0).text();
                    bookCopy.callNo = bookcopyitem.eq(1).text();
                    bookCopy.status =bookcopyitem.eq(2).text();

                    bookItem.copies.push(bookCopy);

                })

                bookitems.push(bookItem);

            })
            var copiesInfo = "";
            if(bookitems.length >= 5){
                for(var i = 0; i < 5;i++){
                    elem = bookitems[i];
                    elem.copies.forEach(function(copy){
                        copiesInfo += copy.location + "\n" + copy.callNo + "\n" + copy.status + "\n";
                    })
                    resMsgContent += elem.title + "\n" + elem.author + "\n" + copiesInfo + '\n';
                }
                resMsgContent += "请进入图书馆官网查看更多资料：" + "https://library.must.edu.mo/search/?"+querystring.stringify(queryContents);
            }else{
                bookitems.forEach(function(elem,index,array){
                    console.log(JSON.stringify(elem) + "\n");
                    elem.copies.forEach(function(copy){
                        copiesInfo += copy.location + "\n" + copy.callNo + "\n" + copy.status + "\n";
                    })
                    resMsgContent += elem.title + "\n" + elem.author + "\n" + copiesInfo + '\n';
                })
            }



        }

    }
    console.log(resMsgContent);
    return resMsgContent;

};

module.exports = crawler;

