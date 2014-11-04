/**
 * Copyright (c) 2014 Leonardo Cardoso (http://leocardz.com)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 *
 * Version: 1.3.0
 */
var myLinkPreview = (function(options) {

    var init = function(){
        var defaults = {
            placeholder: "What's in your mind",
            imageQuantity: -1 // illimited
        };

        var opts = jQuery.extend(defaults, options);

        function trim(str) {
            return str.replace(/^\s+|\s+$/g, "");
        }

        var selector = $(this).selector;
        selector = selector.substr(1);

        $(this).append('<div id="previewLoading_' + selector + '" class="previewLoading"></div> <div style="float: left;"> <textarea type="text" id="text_' + selector + '" style="text-align: left" placeholder="' + opts.placeholder + '" class="text" style="text-align: left"/></textarea> <div style="clear: both"></div> </div> <div id="preview_' + selector + '" class="preview"> <div id="previewImages_' + selector + '" class="previewImages"> <div id="previewImage_' + selector + '" class="previewImage"><img src="img/loader.gif" style="margin-left: 43%; margin-top: 39%;"/> </div> <input type="hidden" id="photoNumber_' + selector + '" class="photoNumber" value="0" /> </div> <div id="previewContent_' + selector + '" class="previewContent"> <div id="closePreview_' + selector + '" title="Remove" class="closePreview" ></div> <div id="previewTitle_' + selector + '" class="previewTitle"></div> <div id="previewUrl_' + selector + '" class="previewUrl"></div> <div id="previewDescription_' + selector + '" class="previewDescription"></div> <div id="hiddenDescription_' + selector + '" class="hiddenDescription"></div> <div id="previewButtons_' + selector + '" class="previewButtons" > <div id="previewPreviousImg_' + selector + '" class="buttonLeftDeactive" ></div> <div id="previewNextImg_' + selector + '" class="buttonRightDeactive" ></div> <div id="photoNumbers_' + selector + '" class="photoNumbers" ></div> <div id="chooseThumbnail_' + selector + '" class="chooseThumbnail"> Choose a thumbnail </div> </div> <div class="nT" id="nT_' + selector + '" > <span id="noThumbDiv_' + selector + '" class="noThumbDiv" ><input type="checkbox" id="noThumb_' + selector + '" class="noThumb noThumbCb" />  No thumbnail</span> </div> </div> <div style="clear: both"></div> </div> <div style="clear: both"></div> <div id="postPreview_' + selector + '" class="postPreview"> <input id="postPreviewButton_' + selector + '" class="postPreviewButton" type="submit" value="Post" /> <div style="clear: both"></div> </div> <div class="previewPostedList" id="previewPostedList_' + selector + '"></div>');

        var text;
        var urlRegex = /(https?\:\/\/|\s)[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})(\/+[a-z0-9_.\:\;-]*)*(\?[\&\%\|\+a-z0-9_=,\.\:\;-]*)?([\&\%\|\+&a-z0-9_=,\:\;\.-]*)([\!\#\/\&\%\|\+a-z0-9_=,\:\;\.-]*)}*/i;
        var block = false;
        var blockTitle = false;
        var blockDescription = false;
        var contentWidth = 355;
        var content = "";
        var image = "";
        var images = "";
        var title = "";
        var url = "";
        var video = "no";
        var videoPlay = "";
        var description = "";
        var hrefUrl = "";
        var videoIframe = "";
        var leftSideContent = "";
        var photoNumber = 0;
        var firstPosted = false;
        var firstPosting = false;
        var nT = false;
        var imageId = "";
        var pTP = "";
        var pDP = "";
        var fancyUrl = '';
        var allowPosting = false;
        var isCrawling = false;

        var textText = "";
        $('#text_' + selector).focus(function() {
            if (trim($('#text_' + selector).val()) === textText) {
                $(this).val('');
                $(this).css({
                    'color': 'black'
                });
            }
        }).blur(function() {
            if (trim($('#text_' + selector).val()) === "") {
                $(this).val(textText);
                $(this).css({
                    'color': 'grey'
                });
            }
        });

        function resetPreview() {
            $('#previewPreviousImg_' + selector).removeClass('buttonLeftActive');
            $('#previewPreviousImg_' + selector).addClass('buttonLeftDeactive');
            $('#previewNextImg_' + selector).removeClass('buttonRightActive');
            $('#previewNextImg_' + selector).addClass('buttonRightDeactive');
            $('#previewButtons_' + selector).show();
            contentWidth = 355;
            photoNumber = 0;
            $('#previewContent_' + selector).css({
                'width': '355px'
            });
            $('#noThumb_' + selector).show();
            $('#nT_' + selector).show();
            $('#noThumb_' + selector).prop('checked', false);
            images = "";
        }


        function noThumbAction(noThumb, inputCheckbox) {
            if (!noThumb) {
                inputCheckbox.prop('checked', true);
                $('#imagePreview_' + selector + '_' + photoNumber).css({
                    'display': 'none'
                });
                $('#whiteImage_' + selector).css({
                    'display': 'block'
                });
                $('#previewContent_' + selector).css({
                    'width': '500px'
                });
                $('#previewButtons_' + selector).hide();
            } else {
                inputCheckbox.prop('checked', false);
                $('#imagePreview_' + selector + '_' + photoNumber).css({
                    'display': 'block'
                });
                $('#whiteImage_' + selector).css({
                    'display': 'none'
                });
                $('#previewContent_' + selector).css({
                    'width': '355px'
                });
                $('#previewButtons_' + selector).show();
            }
        }

        function iframenize(obj) {

            var oldId = obj.prop("id");
            var currentId = oldId.substring(3);
            pTP = "pTP" + currentId;
            pDP = "pDP" + currentId;
            oldId = "#" + oldId;
            currentId = "#" + currentId;
            $(oldId).css({
                'display': 'none'
            });
            $(currentId).css({
                'display': 'block'
            });
            $('#' + pTP).css({
                'width': '495px'
            });
            $('#' + pDP).css({
                'width': '495px'
            });

        }
        
        $('#text_' + selector).bind({
            paste: function() {
                setTimeout(function() {
                    crawlText();
                }, 100);
            },
            keyup: function(e) {
                if ((e.which === 13 || e.which === 32 || e.which === 17)) {
                    crawlText();
                }
            }
        });


        $('#postPreviewButton_' + selector).click(function() {

            imageId = "";
            pTP = "";
            pDP = "";
            text = " " + $('#text_' + selector).val();
            title = $('#previewTitle_' + selector).html();
            description = $('#previewDescription_' + selector).html();

            if (((trim(text) !== "") || (trim(text) === "" && trim(hrefUrl) !== "")) && (allowPosting === true && isCrawling === false)) {
                $.get('php/highlightUrls.php', {
                    text: text,
                    description: description
                }, function(urls) {
                    if ($('#noThumb_' + selector).prop("checked") || images.length === 0) {
                        contentWidth = 495;
                        leftSideContent = "";
                    } else if (images || video) {
                        if (video === "yes") {
                            var pattern = /id="(.+?)"/i;
                            imageId = videoIframe.match(pattern);
                            imageId = imageId[1];
                            pTP = "pTP" + imageId;
                            pDP = "pDP" + imageId;
                            imageId = "img" + imageId;
                            image = "<img id='" + imageId + "' src='" + $('#imagePreview_' + selector + '_' + photoNumber).prop("src") + "' class='imgIframe' style='width: 130px; height: auto; float: left;' ></img>";
                            videoPlay = '<span class="videoPostPlay"></span>';
                            leftSideContent = image + videoPlay;
                        } else {
                            image = "<img src='" + $('#imagePreview_' + selector + '_' + photoNumber).prop("src") + "' style='width: 130px; height: auto; float: left;' ></img>";
                            leftSideContent = '<a href="' + hrefUrl + '" target="_blank">' + image + '</a>';
                        }
                    }
                    content = '<div class="previewPosted">' + '<div class="previewTextPosted">' + urls.urls + '</div>' + videoIframe + '<div class="previewImagesPosted">' + '<div class="previewImagePosted">' + leftSideContent + '</div>' + '</div>' + '<div class="previewContentPosted">' + '<div class="previewTitlePosted" id="' + pTP + '" style="width: ' + contentWidth + 'px" ><a href="' + hrefUrl + '" target="_blank">' + title + '</a></div>' + '<div class="previewUrlPosted">' + fancyUrl + '</div>' + '<div class="previewDescriptionPosted" id="' + pDP + '" style="width: ' + contentWidth + 'px" >' + urls.description + '</div>' + '</div>' + '<div style="clear: both"></div>' + '</div>';

                    /** Database insert */
                    $.post('php/save.php', {
                        text: $('#text_' + selector).val(),
                        image: $('#imagePreview_' + selector + '_' + photoNumber).prop("src"),
                        title: title,
                        canonicalUrl: fancyUrl,
                        url: hrefUrl,
                        description: $('#previewSpanDescription_' + selector).html(),
                        iframe: videoIframe
                    });

                    $('#preview_' + selector).fadeOut("fast", function() {
                        $('#text_' + selector).css({
                            "border": "1px solid #b3b3b3",
                            "border-bottom": "1px solid #e6e6e6"
                        });
                        $('#text_' + selector).val("");
                        $('#previewImage_' + selector).html("");
                        $('#previewTitle_' + selector).html("");
                        $('#previewUrl_' + selector).html("");
                        $('#previewDescription_' + selector).html("");
                        $(content).hide().prependTo('#previewPostedList_' + selector).fadeIn("fast");
                        $(".imgIframe").click(function() {
                            iframenize($(this));
                        });
                        $(".videoPostPlay").click(function() {
                            iframenize($(this).parent().find(".imgIframe"));
                        });

                    });



                    block = false;
                    hrefUrl = '';
                    fancyUrl = '';
                    images = '';
                    video = '';
                }, "json");
                text = "";
            }
        });

        return{
            crawlText : crawlText
        }
    }

    var defaults = {
        placeholder: "What's in your mind",
        imageQuantity: -1 // illimited
    };

    var opts = jQuery.extend(defaults, options);

    var selector = $(this).selector;
    selector = selector.substr(1);

    var text;
    var urlRegex = /(https?\:\/\/|\s)[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})(\/+[a-z0-9_.\:\;-]*)*(\?[\&\%\|\+a-z0-9_=,\.\:\;-]*)?([\&\%\|\+&a-z0-9_=,\:\;\.-]*)([\!\#\/\&\%\|\+a-z0-9_=,\:\;\.-]*)}*/i;
    var block = false;
    var blockTitle = false;
    var blockDescription = false;
    var contentWidth = 355;
    var content = "";
    var image = "";
    var images = "";
    var title = "";
    var url = "";
    var video = "no";
    var videoPlay = "";
    var description = "";
    var hrefUrl = "";
    var videoIframe = "";
    var leftSideContent = "";
    var photoNumber = 0;
    var firstPosted = false;
    var firstPosting = false;
    var nT = false;
    var imageId = "";
    var pTP = "";
    var pDP = "";
    var fancyUrl = '';
    var allowPosting = false;
    var isCrawling = false;

    function trim(str) {
        return str.replace(/^\s+|\s+$/g, "");
    }

    function resetPreview() {
        $('#previewPreviousImg_' + selector).removeClass('buttonLeftActive');
        $('#previewPreviousImg_' + selector).addClass('buttonLeftDeactive');
        $('#previewNextImg_' + selector).removeClass('buttonRightActive');
        $('#previewNextImg_' + selector).addClass('buttonRightDeactive');
        $('#previewButtons_' + selector).show();
        contentWidth = 355;
        photoNumber = 0;
        $('#previewContent_' + selector).css({
            'width': '355px'
        });
        $('#noThumb_' + selector).show();
        $('#nT_' + selector).show();
        $('#noThumb_' + selector).prop('checked', false);
        images = "";
    }

    var crawlText = function(input) {

            allowPosting = true;

            //text = " " + $('#text_' + selector).val();
            text = " " + input;
            if (trim(text) !== "") {
                video = "no";
                videoPlay = "";
                if (/*block === false && */urlRegex.test(text)) {

                    //block = true;
                    $('#preview_' + selector).hide();
                    $('#previewButtons_' + selector).hide();
                    $('#previewLoading_' + selector).html("<img src='img/loader.gif' />");
                    $('#photoNumber_' + selector).val(0);

                    allowPosting = false;
                    isCrawling = true;

             return $.post('php/textCrawler.php', {
                        text: text,

                        imagequantity: opts.imageQuantity
                    }, function(answer) {

                        if (answer.url === null)
                            answer.url = "";
                        if (answer.pageUrl === null)
                            answer.pageUrl = "";
                        if (answer.title === null || answer.title === "")
                            answer.title = "Enter a title";
                        if (answer.description === null || answer.description === "")
                            answer.description = "Enter a description";
                        if (answer.canonicalUrl === null)
                            answer.canonicalUrl = "";
                        if (answer.images === null)
                            answer.images = "";
                        if (answer.video === null)
                            answer.video = "";
                        if (answer.videoIframe === null)
                            answer.videoIframe = "";
                        
                        try {
                            images = (answer.images).split("|");
                        } catch (err) {
                        }
                        images.length = parseInt(images.length);
                        var appendImage = "";
                        for (i = 0; i < images.length; i++) {
                            if (i === 0)
                                appendImage += "<img id='imagePreview_" + selector + "_" + i + "' src='" + images[i] + "' style='width: 130px; height: auto' ></img>";
                            else
                                appendImage += "<img id='imagePreview_" + selector + "_" + i + "' src='" + images[i] + "' style='width: 130px; height: auto; display: none' ></img>";
                        }

                        $('#photoNumbers_' + selector).html("1 of " + images.length);
                        
                        if (firstPosting === false) {
                            firstPosting = true;
                        }
                        allowPosting = true;
                        isCrawling = false;

                    }, "json");
                }
            }

            
        };

    return{
            crawlText : crawlText,
            init : init
        }

})(jQuery);
