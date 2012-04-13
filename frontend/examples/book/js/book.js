$(document).ready(function() {

    $.ajaxSetup({
        cache: false
    });

    var windowWidth = $(window).width(),
        windowHeight = $(window).height(),
        gridHeight = parseInt($("body").css("font-size"), 10),
        headerHeight = $("#book > header").height(),
        footerHeight = $("#book > footer").height(),
        viewportHeight = windowHeight - headerHeight - footerHeight,
        $viewport = $("#viewport"),
        $comments = $("#comments"),
        $prev = $("#prev-page"),
        $next = $("#next-page"),
        currentState = {
            bookId: 1,
            chapterId: 0,
            step: 0,
            steps: undefined,
            href: undefined,
        },
        lastChapter = $.jStorage.get('chapter') || { id: 0, href: 'book/index.html', step: 0 },
        hilightMode = false,
        hilightsFallbackObject = { hilights: [] },
        bookmarksFallbackObject = { bookmarks: [] },
        resizeEvent = undefined;

    var setChapter = function(href, chapterId, step) {
        currentState.chapterId = chapterId;
        $("#current-chapter").text(chapterId);
        $.jStorage.set('chapter', { id: chapterId, href: href });
    };

    var openLink = function(href, chapterId, step) {
        $.get(href).done(function(data) {
            $("#viewport").html(data).css({ "left": "0px"});
            if(chapterId > 0) {
                var $lastParagraph = $("#viewport p").last();
                currentState.steps = parseInt(($lastParagraph.offset().left + $lastParagraph.width()) / windowWidth, 10);
                currentState.step = 0;
                currentState.href = href;
                setChapter(href, chapterId);
                if(step > 0) {
                    jumpToStep(step);
                }
                if($("#hilights-toggle").hasClass('active')) {
                    showHilights();
                }
            }
        });
    };

    var updateBookmarkCount = function(count) {
        $("#bookmark-count").text(count);
    };

    var updateBookmarks = function() {
        var bookmarks = $.jStorage.get('bookmarks') || bookmarksFallbackObject,
            $menu = $("#bookmark-menu");
        $menu.html("");
        if(bookmarks.bookmarks.length > 0) {
            updateBookmarkCount(bookmarks.bookmarks.length);
            $.each(bookmarks.bookmarks, function() {
                var bookmark = this;
                if(bookmark.bookId == currentState.bookId) {
                    var $bookmark = $('<li><a href="' + bookmark.href + '" data-chapter="' + bookmark.chapterId + '" data-step="' + bookmark.step + '">Chapter ' + bookmark.chapterId + ' page ' + parseInt(bookmark.step + 1, 10) + '</a></li>');
                    $menu.append($bookmark);
                }
            });
        }
    };

    var updateComments = function(hilightIndex) {
        var hilights = $.jStorage.get('hilights'),
            hilight = hilights.hilights[hilightIndex],
            $commentsWrap = $comments.find("#hilight-comments"),
            atLeastOneComment = false;
        $comments.find('#add-comment').first().data('index', hilightIndex);
        $comments.find("#hilight-text").text(hilight.text);
        $commentsWrap.html("");
        if(hilight.comments.length > 0) {
            $.each(hilight.comments, function(index, comment) {
                atLeastOneComment = true;
                var $comment = $('<div class="hilight-comment alert alert-info">' + comment.text + '</div>');
                $commentsWrap.append($comment);
            });
        }
        if(!atLeastOneComment) {
            var $comment = $('<div class="hilight-comment alert alert-info">No comments yet</div>');
            $commentsWrap.append($comment);
        }
    };

    var showHilights = function() {
        var hilights = $.jStorage.get('hilights') || hilightsFallbackObject;
        $.each(hilights.hilights, function(index, hilight) {
            if(hilight.chapterId == currentState.chapterId) {
                var $p = $viewport.find('p[data-index=' + hilight.paragraphIndex + ']').first(),
                    text = $p.text(),
                    hilighted = text.substr(0, hilight.start) + 
                                '<span data-index="' + index + '" class="hilight ' + hilight.color + '">' + 
                                hilight.text + 
                                '</span>' + 
                                text.substr(hilight.end, text.length);
                $p.html(hilighted);
            }
        });
    };

    var moveToStep = function(step) {
        if(resizeEvent !== undefined) windowWidth = $(window).width();
        var left = -(step * windowWidth + (gridHeight * step));
        $viewport.animate({ "left": left + "px" });
    };

    var jumpToStep = function(step) {
        if(resizeEvent !== undefined) windowWidth = $(window).width();
        var left = -(step * windowWidth + (gridHeight * step));
        $viewport.css({ "left": left + "px" });
    };

    var adjustSteps = function() {
        if(resizeEvent !== undefined) windowWidth = $(window).width();
        var $lastParagraph = $("#viewport p").last();
        currentState.steps = parseInt(($lastParagraph.offset().left + $lastParagraph.width()) / windowWidth, 10);
    };

    var adjustViewportHeight = function() {
        viewportHeight = $(window).height() - $("#book > header").height() - $("#book > footer").height();
        $viewport.height(viewportHeight);
        $prev.css({
            'height': viewportHeight + 'px',
            'line-height': viewportHeight + 'px'
        });
        $next.css({
            'height': viewportHeight + 'px',
            'line-height': viewportHeight + 'px'
        });
        adjustSteps();
    };

    $(document).on('keyup', function(event) {
        var key = event.keyCode;
        //console.log(key);
        switch(key) {
            case 39:
                $("#next-page").trigger('click');
                break;
            case 37:
                $("#prev-page").trigger('click');
                break;
        }
    });

    $viewport.height(viewportHeight);
    $prev.css({
        'height': viewportHeight + 'px',
        'line-height': viewportHeight + 'px'
    });
    $next.css({
        'height': viewportHeight + 'px',
        'line-height': viewportHeight + 'px'
    });

    $viewport.on('click' ,'a', function(event) {
        event.preventDefault();
        var $link = $(this);
        openLink($link.attr("href"), $link.data('chapter'));
    });

    $viewport.on('click' ,'span', function(event) {
        event.preventDefault();
        updateComments($(this).data('index'));
        $comments.show();
    });

    $comments.on('click', '#add-comment', function(event) {
        event.preventDefault();
        var $textarea = $comments.find("textarea"),
            text = $textarea.val(),
            hilightIndex = $(this).data('index'),
            hilights = $.jStorage.get('hilights');
        if(text != "") {
            hilights.hilights[hilightIndex].comments.push({ text: text });
            if($.jStorage.set('hilights', hilights)) {
                $textarea.val("");
                updateComments(hilightIndex);
            }
        }
    });

    $comments.on('click', '#close-comments', function(event) {
        event.preventDefault();
        $comments.hide();
    });

    $("header .chapters").on('click', 'a', function(event) {
        event.preventDefault();
        var $link = $(this);
        openLink($link.attr("href"), $link.data('chapter'), 0);
    });

    $("header #bookmark-menu").on('click', 'a', function(event) {
        event.preventDefault();
        var $link = $(this);
        openLink($link.attr("href"), $link.data('chapter'), $link.data('step'));
    });

    $("#hilight").on('click', 'a', function(event) {
        if(window.getSelection().toString().length == 0) return false; 
        var selection = window.getSelection(),
            paragraphIndex = $(selection.anchorNode.parentNode).data('index'),
            range = selection.getRangeAt(0);
            hilight = {
                chapterId: currentState.chapterId,
                paragraphIndex: paragraphIndex,
                start: range.startOffset,
                end: range.endOffset,
                text: selection.toString(),
                color: $(this).data('color'),
                comments: [],
            },
            hilights = $.jStorage.get('hilights') || hilightsFallbackObject;
        hilights.hilights.push(hilight);
        $.jStorage.set('hilights', hilights);
    });

    $("#hilight-color .colors").on('click', 'a', function(event) {
        event.preventDefault();
        var $a = $(this),
            $hilight = $("#hilight"),
            color = $(this).data('color'),
            colors = "yellow green red orange";
        $hilight.find("i").first().removeClass(colors).addClass(color);
        $hilight.find("a").first().data('color', color);
    });

    $("#hilights-toggle").on('click', 'a', function(event) {
        event.preventDefault();
        var $parent = $(this).parent();
        $parent.toggleClass('active');
        if($parent.hasClass('active')) {
            showHilights();
        } else {
            $("#viewport span.hilight").each(function() {
                $(this).contents().unwrap();
            });
        }
    });

    $("#bookmark").on('click', 'a', function(event) {
        event.preventDefault();
        var bookmarks = $.jStorage.get('bookmarks') || bookmarksFallbackObject;
        bookmarks.bookmarks.push(currentState);
        $.jStorage.set('bookmarks', bookmarks);
        updateBookmarks();
    });

    openLink(lastChapter.href, lastChapter.id);
    updateBookmarks();

    $prev.click(function() {
        if(currentState.step > 0) {
            currentState.step--;
            moveToStep(currentState.step);
        } else {
            if(currentState.chapterId > 1) {
                var newChapter = parseInt(currentState.chapterId - 1, 10);
                openLink("book/chapters/chapter_" + newChapter + ".html", newChapter, 0); 
            }
        }
    });

    $next.click(function() {
        if(currentState.step < currentState.steps) {
            currentState.step++;
            moveToStep(currentState.step);
        } else {
            if(currentState.chapterId < 4) {
                var newChapter = parseInt(currentState.chapterId + 1, 10);
                openLink("book/chapters/chapter_" + newChapter + ".html", newChapter, 0); 
            }
        }
    });

    $(window).on('resize', function() {
        if(resizeEvent !== undefined) clearTimeout(resizeEvent);
        resizeEvent = setTimeout(function() {
            adjustViewportHeight();
        }, 300);
    });
});
