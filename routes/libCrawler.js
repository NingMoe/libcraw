
var request = require('request');
var querystring = require('querystring');
var cheerio = require('cheerio');

var libCrawler = function(msgContent,msg,wechat) {
    var queryContents = {
        searchtype: 'X',
        SORT: 'D',
        searcharg: msgContent
    };
    var MsgContent = "";
    var url = "https://library.must.edu.mo/search/?" + querystring.stringify(queryContents);

    console.log(url);

    request(url, callback);

    function callback(err, res, body) {
        var resMsgContent = "";
        if (!err && res.statusCode == 200) {
            var $ = cheerio.load(body, {normalizeWhitespace: true});
            //$('.briefcitDetail').each(function(){
            //    console.log($(this).find('.briefcitDetailMain').html().split('<br>')[2]);
            //})
            var bookitems = [];

            $(".briefcitDetail").each(function () {
                var bookItem = {
                    title: '',
                    author: '',
                    public: '',
                    copies: []
                };

                bookItem.title = $(this).find('.briefcitTitle a').text();
                bookItem.author = $(this).find('.briefcitDetailMain').html().split('<br>')[1];

                bookItem.public = $(this).find('.briefcitDetailMain').html().split('<br>')[2];
                var oriLen = $(this).find('.briefcitDetailMain').text().length;
                var sliceLen = $(this).find('.briefcitRatings').children('h2').text().length + $(this).find('.briefcitRequest').text().length;
                bookItem.info = $(this).find('.briefcitDetailMain').text().substring(0, oriLen - sliceLen - 14);

                var copies = $(this).find('.bibItemsEntry').each(function () {

                    var bookCopy = {
                        location: '',
                        callNo: '',
                        status: ''
                    };

                    var bookcopyitem = $(this).find('td');

                    bookCopy.location = bookcopyitem.eq(0).text();
                    bookCopy.callNo = bookcopyitem.eq(1).text();
                    bookCopy.status = bookcopyitem.eq(2).text();

                    bookItem.copies.push(bookCopy);

                })

                bookitems.push(bookItem);

            })

            for (var i = 0; i < 6; i++) {
                //console.log(JSON.stringify(elem) + "\n");
                var elem = bookitems[i];
                if (elem === undefined) {
                    resMsgContent = "图书馆没有这本书呢(ಥ _ ಥ)换一本试试？" + '\n';
                    break;
                } else {
                    var copiesInfo = "";
                    elem.copies.forEach(function (copy) {
                        copiesInfo += copy.location + "\n" + copy.callNo + "\n" + copy.status + "\n";
                    })
                    copiesInfo += "\n";

                    //resMsgContent += elem.title + "\n" + elem.author + "\n" + copiesInfo;
                    resMsgContent += elem.info + "\n" + copiesInfo;

                }

            }
            resMsgContent += "更多资讯请进入图书馆官网查看：" + "https://library.must.edu.mo/search/?" + querystring.stringify(queryContents);
            console.log(resMsgContent);


            var resMsg = {
                fromUserName: msg.toUserName,
                toUserName: msg.fromUserName,
                msgType: "text",
                content: resMsgContent,
                funcFlag: 0
            }

            wechat.sendMsg(resMsg);
        }
    }
}

module.exports = libCrawler;

