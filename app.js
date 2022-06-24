var _rollbarConfig = {
    accessToken: "070cd219446743a18dbdede83b4263bd",
    captureUncaught: true,
    captureUnhandledRejections: true,
    payload: {
        environment: "production",
        client: {
            javascript: {
                code_version: '1.0.0',
            }
        },
    }
};
// Rollbar Snippet
//!function(r){var e={};function o(n){if(e[n])return e[n].exports;var t=e[n]={i:n,l:!1,exports:{}};return r[n].call(t.exports,t,t.exports,o),t.l=!0,t.exports}o.m=r,o.c=e,o.d=function(r,e,n){o.o(r,e)||Object.defineProperty(r,e,{enumerable:!0,get:n})},o.r=function(r){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(r,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(r,"__esModule",{value:!0})},o.t=function(r,e){if(1&e&&(r=o(r)),8&e)return r;if(4&e&&"object"==typeof r&&r&&r.__esModule)return r;var n=Object.create(null);if(o.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:r}),2&e&&"string"!=typeof r)for(var t in r)o.d(n,t,function(e){return r[e]}.bind(null,t));return n},o.n=function(r){var e=r&&r.__esModule?function(){return r.default}:function(){return r};return o.d(e,"a",e),e},o.o=function(r,e){return Object.prototype.hasOwnProperty.call(r,e)},o.p="",o(o.s=0)}([function(r,e,o){"use strict";var n=o(1),t=o(5);_rollbarConfig=_rollbarConfig||{},_rollbarConfig.rollbarJsUrl=_rollbarConfig.rollbarJsUrl||"https://cdn.rollbar.com/rollbarjs/refs/tags/v2.23.0/rollbar.min.js",_rollbarConfig.async=void 0===_rollbarConfig.async||_rollbarConfig.async;var a=n.setupShim(window,_rollbarConfig),l=t(_rollbarConfig);window.rollbar=n.Rollbar,a.loadFull(window,document,!_rollbarConfig.async,_rollbarConfig,l)},function(r,e,o){"use strict";var n=o(2),t=o(3);function a(r){return function(){try{return r.apply(this,arguments)}catch(r){try{console.error("[Rollbar]: Internal error",r)}catch(r){}}}}var l=0;function i(r,e){this.options=r,this._rollbarOldOnError=null;var o=l++;this.shimId=function(){return o},"undefined"!=typeof window&&window._rollbarShims&&(window._rollbarShims[o]={handler:e,messages:[]})}var s=o(4),d=function(r,e){return new i(r,e)},c=function(r){return new s(d,r)};function u(r){return a((function(){var e=this,o=Array.prototype.slice.call(arguments,0),n={shim:e,method:r,args:o,ts:new Date};window._rollbarShims[this.shimId()].messages.push(n)}))}i.prototype.loadFull=function(r,e,o,n,t){var l=!1,i=e.createElement("script"),s=e.getElementsByTagName("script")[0],d=s.parentNode;i.crossOrigin="",i.src=n.rollbarJsUrl,o||(i.async=!0),i.onload=i.onreadystatechange=a((function(){if(!(l||this.readyState&&"loaded"!==this.readyState&&"complete"!==this.readyState)){i.onload=i.onreadystatechange=null;try{d.removeChild(i)}catch(r){}l=!0,function(){var e;if(void 0===r._rollbarDidLoad){e=new Error("rollbar.js did not load");for(var o,n,a,l,i=0;o=r._rollbarShims[i++];)for(o=o.messages||[];n=o.shift();)for(a=n.args||[],i=0;i<a.length;++i)if("function"==typeof(l=a[i])){l(e);break}}"function"==typeof t&&t(e)}()}})),d.insertBefore(i,s)},i.prototype.wrap=function(r,e,o){try{var n;if(n="function"==typeof e?e:function(){return e||{}},"function"!=typeof r)return r;if(r._isWrap)return r;if(!r._rollbar_wrapped&&(r._rollbar_wrapped=function(){o&&"function"==typeof o&&o.apply(this,arguments);try{return r.apply(this,arguments)}catch(o){var e=o;throw e&&("string"==typeof e&&(e=new String(e)),e._rollbarContext=n()||{},e._rollbarContext._wrappedSource=r.toString(),window._rollbarWrappedError=e),e}},r._rollbar_wrapped._isWrap=!0,r.hasOwnProperty))for(var t in r)r.hasOwnProperty(t)&&(r._rollbar_wrapped[t]=r[t]);return r._rollbar_wrapped}catch(e){return r}};for(var p="log,debug,info,warn,warning,error,critical,global,configure,handleUncaughtException,handleAnonymousErrors,handleUnhandledRejection,captureEvent,captureDomContentLoaded,captureLoad".split(","),f=0;f<p.length;++f)i.prototype[p[f]]=u(p[f]);r.exports={setupShim:function(r,e){if(r){var o=e.globalAlias||"Rollbar";if("object"==typeof r[o])return r[o];r._rollbarShims={},r._rollbarWrappedError=null;var l=new c(e);return a((function(){e.captureUncaught&&(l._rollbarOldOnError=r.onerror,n.captureUncaughtExceptions(r,l,!0),e.wrapGlobalEventHandlers&&t(r,l,!0)),e.captureUnhandledRejections&&n.captureUnhandledRejections(r,l,!0);var a=e.autoInstrument;return!1!==e.enabled&&(void 0===a||!0===a||"object"==typeof a&&a.network)&&r.addEventListener&&(r.addEventListener("load",l.captureLoad.bind(l)),r.addEventListener("DOMContentLoaded",l.captureDomContentLoaded.bind(l))),r[o]=l,l}))()}},Rollbar:c}},function(r,e,o){"use strict";function n(r,e,o,n){r._rollbarWrappedError&&(n[4]||(n[4]=r._rollbarWrappedError),n[5]||(n[5]=r._rollbarWrappedError._rollbarContext),r._rollbarWrappedError=null);var t=e.handleUncaughtException.apply(e,n);o&&o.apply(r,n),"anonymous"===t&&(e.anonymousErrorsPending+=1)}r.exports={captureUncaughtExceptions:function(r,e,o){if(r){var t;if("function"==typeof e._rollbarOldOnError)t=e._rollbarOldOnError;else if(r.onerror){for(t=r.onerror;t._rollbarOldOnError;)t=t._rollbarOldOnError;e._rollbarOldOnError=t}e.handleAnonymousErrors();var a=function(){var o=Array.prototype.slice.call(arguments,0);n(r,e,t,o)};o&&(a._rollbarOldOnError=t),r.onerror=a}},captureUnhandledRejections:function(r,e,o){if(r){"function"==typeof r._rollbarURH&&r._rollbarURH.belongsToShim&&r.removeEventListener("unhandledrejection",r._rollbarURH);var n=function(r){var o,n,t;try{o=r.reason}catch(r){o=void 0}try{n=r.promise}catch(r){n="[unhandledrejection] error getting `promise` from event"}try{t=r.detail,!o&&t&&(o=t.reason,n=t.promise)}catch(r){}o||(o="[unhandledrejection] error getting `reason` from event"),e&&e.handleUnhandledRejection&&e.handleUnhandledRejection(o,n)};n.belongsToShim=o,r._rollbarURH=n,r.addEventListener("unhandledrejection",n)}}}},function(r,e,o){"use strict";function n(r,e,o){if(e.hasOwnProperty&&e.hasOwnProperty("addEventListener")){for(var n=e.addEventListener;n._rollbarOldAdd&&n.belongsToShim;)n=n._rollbarOldAdd;var t=function(e,o,t){n.call(this,e,r.wrap(o),t)};t._rollbarOldAdd=n,t.belongsToShim=o,e.addEventListener=t;for(var a=e.removeEventListener;a._rollbarOldRemove&&a.belongsToShim;)a=a._rollbarOldRemove;var l=function(r,e,o){a.call(this,r,e&&e._rollbar_wrapped||e,o)};l._rollbarOldRemove=a,l.belongsToShim=o,e.removeEventListener=l}}r.exports=function(r,e,o){if(r){var t,a,l="EventTarget,Window,Node,ApplicationCache,AudioTrackList,ChannelMergerNode,CryptoOperation,EventSource,FileReader,HTMLUnknownElement,IDBDatabase,IDBRequest,IDBTransaction,KeyOperation,MediaController,MessagePort,ModalWindow,Notification,SVGElementInstance,Screen,TextTrack,TextTrackCue,TextTrackList,WebSocket,WebSocketWorker,Worker,XMLHttpRequest,XMLHttpRequestEventTarget,XMLHttpRequestUpload".split(",");for(t=0;t<l.length;++t)r[a=l[t]]&&r[a].prototype&&n(e,r[a].prototype,o)}}},function(r,e,o){"use strict";function n(r,e){this.impl=r(e,this),this.options=e,function(r){for(var e=function(r){return function(){var e=Array.prototype.slice.call(arguments,0);if(this.impl[r])return this.impl[r].apply(this.impl,e)}},o="log,debug,info,warn,warning,error,critical,global,configure,handleUncaughtException,handleAnonymousErrors,handleUnhandledRejection,_createItem,wrap,loadFull,shimId,captureEvent,captureDomContentLoaded,captureLoad".split(","),n=0;n<o.length;n++)r[o[n]]=e(o[n])}(n.prototype)}n.prototype._swapAndProcessMessages=function(r,e){var o,n,t;for(this.impl=r(this.options);o=e.shift();)n=o.method,t=o.args,this[n]&&"function"==typeof this[n]&&("captureDomContentLoaded"===n||"captureLoad"===n?this[n].apply(this,[t[0],o.ts]):this[n].apply(this,t));return this},r.exports=n},function(r,e,o){"use strict";r.exports=function(r){return function(e){if(!e&&!window._rollbarInitialized){for(var o,n,t=(r=r||{}).globalAlias||"Rollbar",a=window.rollbar,l=function(r){return new a(r)},i=0;o=window._rollbarShims[i++];)n||(n=o.handler),o.handler._swapAndProcessMessages(l,o.messages);window[t]=n,window._rollbarInitialized=!0}}}}]);
// End Rollbar Snippet

(function($) {

    let language = 'de';

    let translations = {
        'number_of_stages': {
            'de' : 'Etappen',
            'en' : 'Stages'
        },
        'n_stages': {
            'de' : 'Etappe(n)',
            'en' : 'Stage(s)'
        },
        'athlete.name': {
            'de' : 'Name',
            'en' : 'Name'
        },
        'badges': {
            'de' : 'Badges',
            'en' : 'Badges'
        },
        'no_results': {
            'de' : 'Noch keine Resultate',
            'en' : 'No results yet'
        },
        'ranking_time': {
            'de' : 'Zeit',
            'en' : 'Time'
        },
        'time_back': {
            'de' : 'Rückstand',
            'en' : 'Back'
        },
        'supporter': {
            'de' : 'Unterstützer',
            'en' : 'Supporter'
        },
        'xxx': {
            'de' : 'xxx',
            'en' : 'xxx'
        }
    };

    let translate = function(node) {

        if (node in translations){

            return translations[node][language];
        }
        else{
            return "!"+node+"!";
        }

    };

    let extractBadges = function (badges) { //Extract an array of strings from array of objects with type:badgeType

        var badgesArr = [];

        if(badges instanceof Array){

            badges.forEach(function(badgeObj){

                if('type' in badgeObj){
                    badgesArr.push(badgeObj.type);
                }

            });

        }

        return badgesArr;
    };


    $.fn.laceUpInit = function(options) {

        var settings = $.extend(this.data(), options); //extend from the meta data properties and options variable (to set a different mainSelector)

        $('a.laceup-connect-link').each(function() {
            $(this).attr('href', settings.appUrl+'/tour/'+settings.slug+'/connect');
        });

        $('a.laceup-donate-link').each(function() {
            $(this).attr('href', settings.appUrl+'/tour/'+settings.slug+'/donate');
        });

        $('a.laceup-stravaclub-link').each(function() {
            $(this).attr('href', settings.stravaclubLink);
        });

        console.log("laceUpInit");
        console.log(settings);

        if(settings.language){
            language = settings.language;
        }

        return this;

    };

    $.fn.laceUpUserStatus = function(options) {

        var settings = $.extend({
            refreshSeconds: 240,
            signupBtnSelector: '.signupbutton',
            connectURL: this.data('appUrl')+'/tour/'+this.data('slug')+'/connect',
            donateURL: this.data('appUrl')+'/tour/'+this.data('slug')+'/donate',
        }, this.data(), options); //extend from the meta data properties and options variable (to set a different mainSelector)

        var handleJoin = function(data){

            if(data.id){

                $('div.join').hide(); //has already joined

                if(!data.paid) { //but not supported:

                    $('div.support').show();

                }
            }

        };

        var handleSupportName = function(data){

            if(data.id){

                $('.supportname').each(function() {

                    $(this).text($(this).text().replace('$$firstname$$', data.firstname));

                });
            }

        };

        var handleSignupButton = function(data){

            $(settings.signupBtnSelector).each(function() {

                if(data.paid){

                    //same URL if connect
                    $(this).text($(this).data('text-profile')); //set the profile text, eg. "Mein Profil"

                }
                else{

                    $(this)
                        .text($(this).data('text-support'))//set the support text, eg. "Jetzt unterstützen"
                        .attr('href',settings.appUrl+'/tour/'+settings.slug+'/donate'); //set the support url

                }

            });

        };

        this.loadStatus = function() {

            $.ajax({
                url: settings.appUrl + "/api/me.json",
                type: 'GET',
                dataType: 'json',
                headers: {
                    // Important: JQuery omits xhr headers for cross-site requests by default.
                    // Thus the app uses URL's to redirect user after successful login.
                    'X-Requested-With': 'XMLHttpRequest'
                },
                xhrFields: {
                    withCredentials: true
                },
                statusCode: {
                    403: function() { //forbidden - not logged in

                        console.log("me.json forbidden - not logged in");

                        $('.laceup-show-if-paid-user').hide();
                        $('.laceup-show-if-free-user').hide();
                        $('.laceup-show-if-known-user').hide();
                        $('.laceup-show-if-unknown-user').show();

                    },
                    500: function() {

                        console.log("me.json error");

                        $('.laceup-show-if-paid-user').hide();
                        $('.laceup-show-if-free-user').hide();
                        $('.laceup-show-if-known-user').hide();
                        $('.laceup-show-if-unknown-user').show();

                    },
                    200: function(data) {

                        console.log("me.json success:");
                        console.log(data);

                        if(data.tour.slug === settings.slug && data.id && data.paid) {

                            $('.laceup-show-if-free-user').hide();
                            $('.laceup-show-if-unknown-user').hide();
                            $('.laceup-show-if-known-user').show();
                            $('.laceup-show-if-paid-user').show();

                        }
                        else if(data.tour.slug === settings.slug && data.id && !data.paid){

                            $('.laceup-show-if-paid-user').hide();
                            $('.laceup-show-if-unknown-user').hide();
                            $('.laceup-show-if-known-user').show();
                            $('.laceup-show-if-free-user').show();
                        }
                        else{

                            $('.laceup-show-if-paid-user').hide();
                            $('.laceup-show-if-free-user').hide();
                            $('.laceup-show-if-known-user').hide();
                            $('.laceup-show-if-unknown-user').show();

                        }

                        if(data.tour.slug === settings.slug && data.id && data.firstname) {

                            $('.laceup-profile-placeholder').each(function() {

                                $(this).text(
                                    $(this).text()
                                        .replace('$$firstname$$', data.firstname)
                                        .replace('$$lastname$$', data.lastname)
                                );

                            });

                        }

                        if(data.tour.slug === settings.slug){

                            handleJoin(data);
                            handleSupportName(data);
                            handleSignupButton(data);

                        }
                        else{

                            console.log("me.json: Tour slug mismatch");

                        }

                        // Set the user ID using signed-in user_id.
                        if (typeof gtag === 'function') {
                            gtag('set', {'user_id': data.id});
                        } else if (typeof ga === 'function') {
                            ga('set', 'userId', data.id);
                        }

                    }
                }
            });

            return this;

        };

        function triggerRefresh($that)
        {

            if(settings.refreshSeconds > 0){ //set 0 to disable refresh

                setInterval(function(){
                    $that.loadStatus();
                }, 1000*settings.refreshSeconds);

            }

        }

        triggerRefresh(this);

        this.loadStatus();

        return this;

    };



    $.fn.laceUpRecentActivities = function(options) {

        var settings = $.extend({
            mainSelector: '#laceup-recentactivities',
            refreshSeconds: 120,
            lastActivities: 20,
            paidBadgeURL :'https://nicoschefer.github.io/laceup-jq/img/paid-badge.svg'
        }, this.data(), options); //extend from the meta data properties and options variable (to set a different mainSelector)

        $.extend(settings, $(settings.mainSelector).data()); //check the mainSelector data attribute for further settings

        this.loadContent = function() {

            console.log('Loading recent, last '+settings.lastActivities);

            $.ajax({url: settings.appUrl + "/api/graphql?recent-activities",
                contentType: "application/json",
                type:'POST',
                data: JSON.stringify({ query:`{
                    efforts(
                      last: `+settings.lastActivities+`,
                      order: {start_date: "asc"},
                      stage_tour_slug: "`+settings.slug+`"
                      ) {
                      edges {
                        node {
                          start_date
                          ranking_time
                          effort_strava_link
                          elapsed_time
                          stage {
                            name
                          }
                          ranking {
                            rank
                          }
                          athlete {
                            name
                            profile
                            paid
                          }
                        }
                      }
                    }
                  }
      `}),
                success: function(result) {

                    var htmlScaffold = $(settings.mainSelector+' .recent-item').first().clone(); //allow webflow mobile css for styling

                    $(settings.mainSelector+' .recent-item').remove(); //start empty

                    $.each(result.data.efforts.edges, function( key, val ) {

                        var effortTimeAgo = moment(val.node.start_date).fromNow();

                        if(val.node.athlete.paid){
                            $(htmlScaffold).addClass('recent-item-paid');
                        }
                        else{
                            $(htmlScaffold).removeClass('recent-item-paid');
                        }

                        $(htmlScaffold).find('.recent-profile').html(
                            '<div class="profile-img" style="background-image: url('+val.node.athlete.profile+');">' +
                                (val.node.athlete.paid ?
                                    '<a title="Unterstützer" href="'+settings.appUrl+'/tour/'+settings.slug+'/donate"><img class="paid-badge" src="'+settings.paidBadgeURL+'"></a>' :
                                    '')+
                            '</div>'
                        );
                        $(htmlScaffold).find('.recent-date').html(effortTimeAgo);
                        $(htmlScaffold).find('.recent-name').html(val.node.athlete.name);
                        $(htmlScaffold).find('.recent-stage').html(val.node.stage.name);

                        var recentRankingClass = (val.node.ranking !== null && val.node.ranking.rank <= 3) ? "recent-ranking-"+val.node.ranking.rank : '';
                        var recentRankingTitle = (val.node.ranking !== null) ? val.node.ranking.rank : 'n/a';
                        $(htmlScaffold).find('.recent-time').html("<a target=\"_blank\" href=\""+val.node.effort_strava_link+"\" title=\"Rang "+recentRankingTitle+"\"><span class=\"recent-ranking "+recentRankingClass+"\">"+val.node.ranking_time+"</span></a>");

                        //create a clone and add ot on top of the other items
                        $(settings.mainSelector+' .recent-wrapper').prepend(htmlScaffold.clone());

                    });

                }
            });

            return this;

        };

        function triggerRefresh($that)
        {

            if(settings.refreshSeconds > 0){ //set 0 to disable refresh

                setInterval(function(){
                    $that.loadContent();
                }, 1000*settings.refreshSeconds);

            }

        }

        if($(settings.mainSelector).length){

            triggerRefresh(this);

            return this.loadContent();
        }

        return this;

    };




    $.fn.laceUpLeaderboard = function(options) {

        var settings = $.extend({
            mainSelector: '.laceup-leaderboard',
            refreshSeconds: 240,
            limit: 10
        }, this.data(), options); //extend from the meta data properties and options variable (to set a different mainSelector)

        this.loadContent = function() {

            $(settings.mainSelector).each(function(index, el) { //data-sex="F", data-sex="M" | data-limit="10"

                var eleSettings = $.extend({}, settings, $(el).data()); //check the elements data attribute for further settings

                $(el).html('');

                $.ajax({
                    url: eleSettings.appUrl + "/api/graphql?leaderboard",
                    contentType: "application/json",
                    type: 'POST',
                    data: JSON.stringify({
                        query:
                            `{
                              overallRankings(tour_slug: "`+eleSettings.slug+`", sex: "`+$(el).data('sex')+`", first: `+eleSettings.limit+`) {
                                edges {
                                  node {
                                    id
                                    stage_lag
                                    time_to_first_formatted
                                    time_to_first
                                    rank
                                    number_of_stages
                                    ranking_time
                                    athlete {
                                      id
                                      name
                                      paid
                                    }
                                    tour {
                                       mode
                                    }
                                  }
                                }
                              }
                            }`}),
                    success: function(response) {

                        $.each(response.data.overallRankings.edges, function( key, val ) {

                            //console.log(val.node);

                            var ranking = val.node;
                            var lag = "&nbsp;"; //first rank
                            if (ranking.stage_lag > 0) {
                                lag = "+" + ranking.stage_lag + " Etappe(n)";
                            } else if (ranking.time_to_first > 0) {
                                lag = "+" + ranking.time_to_first_formatted;
                            }

                            var numberOfStage = (ranking.tour.mode ==='enduro') ? '' : '<br><small class="paragraph-light paragraph-small">'+ranking.number_of_stages+' Etappe(n)</small>';

                            var itemHTML = '<div class="result-item result-rank-'+ranking.rank+'">'+
                                '<div class="result-rank '+(ranking.athlete.paid ? 'result-rank-paid' : '')+'"><div>'+ranking.rank+'</div></div>'+
                                '<div class="result-name truncate">'+
                                ranking.athlete.name+
                                numberOfStage+
                                '</div>'+
                                '<div class="result-time">'+
                                ranking.ranking_time+
                                '<br><small class="paragraph-light paragraph-small" style="float:right;">'+lag+'</small>'+
                                '</div>'+
                                '</div>';

                            $(el).append(itemHTML);
                        });
                    }
                });
            });

            return this;

        };

        function triggerRefresh($that)
        {

            if(settings.refreshSeconds > 0){ //set 0 to disable refresh

                setInterval(function(){
                    $that.loadContent();
                }, 1000*settings.refreshSeconds);

            }

        }

        if($(settings.mainSelector).length) {

            triggerRefresh(this);

            return this.loadContent();

        }

        return this;

    };



    $.fn.laceUpStagePodium = function(options) {

        var settings = $.extend({
            mainSelector: '.laceup-podium',
            refreshSeconds: 240,
            limit: 3
        }, this.data(), options); //extend from the meta data properties and options variable (to set a different mainSelector)

        this.loadContent = function() {

            $(settings.mainSelector).each(function(index, el) { //data-sex="F", data-sex="M", .podium-laceup-stage-id (div element containing the stage id), data-limit="3"

                var eleSettings = $.extend({}, settings, $(el).data()); //check the elements data attribute for further settings

                var stageId = $(el).closest('.podium-item').find('.podium-laceup-stage-id').html(); //Webflow workaround: not possible to populate a data- attribute from a collection

                $.getJSON(
                    eleSettings.appUrl + "/api/rankings?stage.id="+stageId+"&sex="+$(el).data('sex')+"&itemsPerPage="+eleSettings.limit,
                    function(response) {

                        $.each(response, function( key, val ) {

                            var rankItem = (key+1); // unique: 1,2,3

                            var lbItem = $(el).find('.result-rank-'+rankItem); //don't use val.rank, as this could be a shared rank (rank 1, 1, 3). and we need to find the item

                            $(lbItem).find('.result-rank > div').html(val.rank);
                            $(lbItem).find('.result-name').html(val.athlete.name);
                            $(lbItem).find('.result-time').html('<a style="font-family: monospace; text-decoration: none;" target="_blank" href="'+val.effort.effort_strava_link+'">'+val.ranking_time+'</a>');

                            $(lbItem).removeClass('result-rank-'+rankItem).addClass('result-rank-'+val.rank); //remove the class to find the correct row (unique, 1,2,3) and add the actual ranking (not unique, can be 1,1,3) used to display the gold/silver/bronze badge

                        });
                    });

            });

            return this;

        };

        function triggerRefresh($that)
        {

            if(settings.refreshSeconds > 0){ //set 0 to disable refresh

                setInterval(function(){
                    $that.loadContent();
                }, 1000*settings.refreshSeconds);

            }

        }

        triggerRefresh(this);

        this.loadContent();

        return this;

    };



    $.fn.laceUpStageRanking = function(options) {

        var settings = $.extend({
            mainSelector: '.laceup-stageranking',
            limit: 3,
            paidBadgeURL :'https://nicoschefer.github.io/laceup-jq/img/paid-badge.svg'
        }, this.data(), options); //extend from the meta data properties and options variable (to set a different mainSelector)


        this.loadContent = function() {

            $(settings.mainSelector+':not([data-stageid=""])').each(function(index, el) {

                var eleSettings = $.extend({}, settings, $(el).data()); //check the elements data attribute for further settings

                $(el).DataTable({
                    "retrieve": true,
                    "ajax": {
                        url: eleSettings.appUrl+"/api/rankings?stage.id="+$(el).data('stageid')+"&sex="+$(el).data('sex')+"&pagination=false",
                        dataSrc: ""
                    },
                    "processing": true,
                    "conditionalPaging": true,
                    "lengthMenu": [[100, -1], [100, "Alle Resultate"]],
                    "ordering": false,
                    "searching": false,
                    "info": false,
                    "language": {
                        "url": "//cdn.datatables.net/plug-ins/9dcbecd42ad/i18n/German.json",
                        "emptyTable": "Noch keine Resultate"
                    },
                    "columns": [
                        { "title": "Rang", "data": "rank" },
                        {
                            "title": "",
                            "data": "athlete.profile",
                            "render": function(data, type, row) {

                                return '<div class="ranking-profile '+(row.athlete.paid ? 'ranking-profile-paid' : '')+'">'+
                                            '<div class="profile-img" style="background-image: url('+data+');">'+
                                                (row.athlete.paid ?
                                                    ('<a class="ranking-paid-badge" title="Unterstützer" href="'+eleSettings.appUrl+'/tour/'+eleSettings.slug+'/donate"><img class="paid-badge" src="'+eleSettings.paidBadgeURL+'"></a>') :
                                                    '')+
                                            '</div>'+
                                        '</div>';
                            }
                        },
                        {
                            "title": "Name",
                            "data": "athlete.name",
                            "render": function(name, type, row) {
                                return '<a style="text-decoration: none;" href="'+row.athlete.oauth_link+'" target="_blank">'+name+'</a>';
                            }
                        },
                        {
                            "title": "Zeit",
                            "data": "ranking_time",
                            "render": function(data, type, row) {
                                return '<a style="font-family: monospace; text-decoration: none;" target="_blank" href="'+row.effort.effort_strava_link+'">'+data+'</a>';
                            }
                        },
                    ],
                    columnDefs: [
                        { targets: 0, width: '5%' },
                        { targets: 1, width: '10%' },
                        { targets: 2, width: '50%' },
                        { targets: -1, className: 'dt-body-right', width: '35%' }
                    ]
                }).on('page.dt', function() { //on pagination click, scroll to top of the table
                    $('html, body').animate({
                        scrollTop: $(el).offset().top
                    }, 'fast');
                });
            });

            return this;

        };

        this.loadContent();

        return this;

    };


    $.fn.laceUpOverallRanking = function(options) {

        var settings = $.extend({
            mainSelector: '.laceup-ranking',
            paidBadgeURL :'https://nicoschefer.github.io/laceup-jq/img/paid-badge.svg'
        }, this.data(), options); //extend from the meta data properties and options variable (to set a different mainSelector)

        this.loadContent = function() {

            $(settings.mainSelector).each(function(index, el) {

                var eleSettings = $.extend({}, settings, $(el).data()); //check the elements data attribute for further settings

                $(el).DataTable({
                    "retrieve": true,
                    "ajax": {
                        url: eleSettings.appUrl+"/api/overall_rankings?tour.slug="+eleSettings.slug+"&sex="+$(el).data('sex')+"&pagination=false",
                        dataSrc: ""
                    },
                    "processing": true,
                    "paging": false,
                    "ordering": false,
                    "searching": false,
                    "info": false,
                    "responsive": true,
                    "language": {
                        "emptyTable": "Noch keine Resultate"
                    },
                    "columns": [
                        {
                            "title": "",
                            "data": "rank"
                        },
                        {
                            "title": "",
                            "data": "athlete.profile",
                            "render": function(data, type, row) {

                                return '<div class="ranking-profile '+(row.athlete.paid ? 'ranking-profile-paid' : '')+'">'+
                                            '<div class="profile-img" style="background-image: url('+data+');">'+
                                                (row.athlete.paid ? '<a title="Unterstützer" href="'+eleSettings.appUrl+'/tour/'+eleSettings.slug+'/donate"><img class="paid-badge" src="'+eleSettings.paidBadgeURL+'"></a>' : '')+
                                            '</div>'+
                                        '</div>';

                            }
                        },
                        {
                            "title": "Name",
                            "data": "athlete.name",
                            "render": function(name, type, row) {
                                return '<a style="text-decoration: none;" href="'+row.athlete.oauth_link+'" target="_blank">'+name+'</a>';
                            }
                        },
                        {
                            "title": "Etappen",
                            "data": "number_of_stages"
                        },
                        {
                            "title": "Zeit",
                            "data": "ranking_time",
                            "render": function(data, type, row) {
                                return '<span class="ranking-time">'+data+'</span>';
                            }
                        },
                        {
                            "title": "Rückstand",
                            "render": function(data, type, row) {
                                var lag = "";
                                if (row.rank > 1 && row.stage_lag === 0) {
                                    lag = row.time_to_first_formatted;
                                }
                                return '<span class="ranking-time ranking-time-back">'+lag+'</span>'; //maybe add some formatting?
                            }
                        }
                    ],
                    columnDefs: [
                        { responsivePriority: 1, targets: 0, width: '5%' }, // rank
                        { responsivePriority: 2, targets: 1, width: '10%' }, // profile
                        { responsivePriority: 3, targets: 2, width: '60%' }, // name
                        { responsivePriority: 6, targets: 3, width: '5%' }, // stages
                        { responsivePriority: 4, targets: 4, className: 'dt-body-right', width: '10%' }, // time
                        { responsivePriority: 5, targets: 5, className: 'dt-body-right', width: '10%' } // time back
                    ],
                    "drawCallback": function () {
                        var api = this.api();
                        var rows = api.rows( {page: 'current'} ).nodes();
                        var last = null;
                        api.column(3, {page: 'current'} ).data().each( function ( group, i ) {
                            if ( last !== group ) {
                                $(rows).eq( i ).before(
                                    '<tr style="text-align: center;"><td colspan="6"><small>'+group+' Etappe(n)</small></td></tr>'
                                );
                                last = group;
                            }
                        });
                    }
                });
            });

            return this;

        };


        this.loadContent();

        return this;

    };


    $.fn.laceUpOverallRankingWithBadges = function(options) {

        //bee More than n (5?) efforts
        //hare: All stages in one day
        //bat: An effort from dusk till dawn

        var settings = $.extend({
            mainSelector: '.laceup-ranking',
            paidBadgeURL :'https://nicoschefer.github.io/laceup-jq/img/paid-badge.svg'
        }, this.data(), options); //extend from the meta data properties and options variable (to set a different mainSelector)

        this.loadContent = function() {

            $(settings.mainSelector).each(function(index, el) {

                var eleSettings = $.extend({}, settings, $(el).data()); //check the elements data attribute for further settings

                //Allow overwriting the available badges
                var availableBadges = eleSettings.badges.length ? eleSettings.badges.split(',') : ["bee","bat","hare"];

                $(el).DataTable({
                    "retrieve": true,
                    "ajax": {
                        url: eleSettings.appUrl+"/api/overall_rankings?tour.slug="+eleSettings.slug+"&sex="+$(el).data('sex')+"&pagination=false",
                        dataSrc: ""
                    },
                    "processing": true,
                    "paging": false,
                    "ordering": false,
                    "searching": false,
                    "info": false,
                    "responsive": true,
                    "language": {
                        "emptyTable": translate('no_results')
                    },
                    "columns": [
                        {
                            "title": "",
                            "data": "rank"
                        },
                        {
                            "title": "",
                            "data": "athlete.profile",
                            "render": function(data, type, row) {

                                return '<div class="ranking-profile '+(row.athlete.paid ? 'ranking-profile-paid' : '')+'">'+
                                    '<div class="profile-img" style="background-image: url('+data+');">'+
                                    (row.athlete.paid ? '<a title="'+translate('supporter')+'" href="'+eleSettings.appUrl+'/tour/'+eleSettings.slug+'/donate"><img class="paid-badge" src="'+eleSettings.paidBadgeURL+'"></a>' : '')+
                                    '</div>'+
                                    '</div>';

                            }
                        },
                        {
                            "title": translate('athlete.name'),
                            "data": "athlete.name",
                            "render": function(name, type, row) {
                                return '<a style="text-decoration: none;" href="'+row.athlete.oauth_link+'" target="_blank">'+name+'</a>';
                            }
                        },
                        {
                            "title": translate('number_of_stages'),
                            "data": "number_of_stages"
                        },
                        {
                            "title": translate('badges'),
                            "render": function(data, type, row) {

                                var athBadges = extractBadges(row.athlete.badges);
                                var badgesHtml = '';

                                $.each(availableBadges, function(key, thisBadge ) {

                                    var isPassive = athBadges.includes(thisBadge) ? '' : 'achieved-badge-passive';
                                    //var isPassive = ((Math.random()*(row.rank/2)) < 1) ? '' : 'achieved-badge-passive';

                                    badgesHtml += '<div class="achieved-badge '+isPassive+' '+thisBadge+'"></div>';

                                });

                                return '<div class="badge-container">'+badgesHtml+'</div>';
                            }
                        },
                        {
                            "title": translate('ranking_time'),
                            "data": "ranking_time",
                            "render": function(data, type, row) {
                                return '<span class="ranking-time">'+data+'</span>';
                            }
                        },
                        {
                            "title": translate('time_back'),
                            "render": function(data, type, row) {
                                var lag = "";
                                if (row.rank > 1 && row.stage_lag === 0) {
                                    lag = row.time_to_first_formatted;
                                }
                                return '<span class="ranking-time ranking-time-back">'+lag+'</span>'; //maybe add some formatting?
                            }
                        }
                    ],
                    columnDefs: [
                        { responsivePriority: 1, targets: 0, width: '5%' }, // rank
                        { responsivePriority: 2, targets: 1, width: '10%' }, // profile
                        { responsivePriority: 3, targets: 2, width: '50%' }, // name
                        { responsivePriority: 6, targets: 3, width: '5%' }, // stages
                        { responsivePriority: 7, targets: 4, width: '10%' }, // badges
                        { responsivePriority: 4, targets: 5, className: 'dt-body-right', width: '10%' }, // time
                        { responsivePriority: 5, targets: 6, className: 'dt-body-right', width: '10%' } // time back
                    ],
                    "drawCallback": function () {
                        var api = this.api();
                        var rows = api.rows( {page: 'current'} ).nodes();
                        var last = null;
                        api.column(3, {page: 'current'} ).data().each( function ( group, i ) {
                            if ( last !== group ) {
                                $(rows).eq( i ).before(
                                    '<tr style="text-align: center;"><td colspan="7"><small>'+group+' '+translate('n_stages')+'</small></td></tr>'
                                );
                                last = group;
                            }
                        });
                    }
                });
            });

            return this;

        };


        this.loadContent();

        return this;

    };


    $.fn.laceUpTrophyRanking = function(options) {

        var settings = $.extend({
            mainSelector: '.laceup-trophy-ranking',
            trophyType: null, //Required! eg. stage_completion_effort_count
            refreshSeconds: 240,
            sex: 'X'
        }, this.data(), options); //extend from the meta data properties and options variable (to set a different mainSelector)

        this.loadContent = function() {


            $.getJSON(settings.appUrl + "/api/stages.json?tour.slug="+settings.slug, function(stagesData) {

                let stagesDataById = [];
                $.each(stagesData, function(key, stageData) {
                    stagesDataById['stage-'+stageData.id] = stageData; //Prefix stage- to avoid integers as associative array keys
                });

                $(settings.mainSelector).each(function(index, el) { //data-sex="F", data-sex="M", .podium-laceup-stage-id (div element containing the stage id), data-limit="3"

                    var eleSettings = $.extend({}, settings, $(el).data()); //check the elements data attribute for further settings

                    //Allow overwriting the available badges
                    var availableBadges = eleSettings.badges.length ? eleSettings.badges.split(',') : ["bee","bat","hare"];

                    var url = eleSettings.appUrl + "/api/trophies.json?tour.slug="+eleSettings.slug+"&type="+eleSettings.trophyType+"&sex="+eleSettings.sex+"&"+(eleSettings.limit?'itemsPerPage='+eleSettings.limit:'paginate=false');
                    $.getJSON(url, function(response) {

                            $(el).empty();

                            $.each(response, function( key, val ) {

                                var athBadges = extractBadges(val.athlete.badges);
                                var badgesHtml = '';
                                $.each(availableBadges, function(key, thisBadge ) {

                                    var isPassive = athBadges.includes(thisBadge) ? '' : 'achieved-badge-passive';
                                    badgesHtml += '<div class="achieved-badge '+isPassive+' '+thisBadge+'"></div>';

                                });

                                var stagesHTML = '';
                                $.each(val.data.distinct_stage_ids, function(key, stageId) {
                                    if(stageId){
                                        stagesHTML += '<div role="img" class="trophy-stage-badge trophy-stage-id-'+stageId+'" title="'+stagesDataById['stage-'+stageId].name+'">'+stageId+'</div>';
                                    }
                                });

                                var itemHTML =
                                    '<div class="trophy-item trophy-rank-'+val.rank+' clearfix">'+
                                        '<div class="trophy-rank '+(val.athlete.paid ? 'trophy-rank-paid' : '')+'">' +
                                            '<div>'+val.rank+'</div>' +
                                        '</div>'+
                                        '<div class="trophy-name truncate">'+val.athlete.name+'</div>'+
                                        '<div class="trophy-badges">'+badgesHtml+'</div>'+
                                        '<div class="trophy-stages clearfix">'+stagesHTML+'</div>'+
                                    '</div>';

                                $(el).append(itemHTML);

                            });

                            if(!response.length){
                                $(el).append('<p>'+translate('no_results')+'</p>');
                            }

                        });
                });

            });

            return this;

        };

        function triggerRefresh($that)
        {

            if(settings.refreshSeconds > 0){ //set 0 to disable refresh

                setInterval(function(){
                    $that.loadContent();
                }, 1000*settings.refreshSeconds);

            }

        }

        triggerRefresh(this);

        this.loadContent();

        return this;

    };

    $.fn.laceUpSupporter = function(options) {

        var settings = $.extend({
            mainSelector: '#laceup-supporter',
            refreshSeconds: 480,
            limit: 100
        }, this.data(), options); //extend from the meta data properties and options variable (to set a different mainSelector)

        $.extend(settings, $(settings.mainSelector).data()); //check the mainSelector data attribute for further settings

        this.loadContent = function() {

            $.ajax({
                url: settings.appUrl+"/api/athletes.json?tour.slug="+settings.slug+"&paid=true&pagination=false",
                type: 'GET',
                dataType: 'json',
                success: function(supporterResponse) {

                    $(settings.mainSelector).html("");

                    const supporterResponseShuffled = supporterResponse.sort(()=> Math.random() - 0.5); //not perfect, but ok for a small array and no need for true randomness

                    $.each(supporterResponseShuffled, function( key, val ) {

                        if(val.oauth_id === 3129449) return; //Nico
                        if(val.oauth_id === 9959175) return; //Sebastian
                        if(val.oauth_id === 16814702) return; //Tobias

                        $(settings.mainSelector).append("<a href='"+val.oauth_link+"' class='link-inline' target='_blank'>"+val.name+"</a> ");

                    });

                },
                error: function(data) {
                    console.log(data);
                }
            });

            return this;

        };

        function triggerRefresh($that)
        {

            if(settings.refreshSeconds > 0){ //set 0 to disable refresh

                setInterval(function(){
                    $that.loadContent();
                }, 1000*settings.refreshSeconds);

            }

        }

        if($(settings.mainSelector).length) {

            triggerRefresh(this);

            this.loadContent();

        }

        return this;

    };


    //https://app.laceup.io/api/stages/50.json


})(jQuery);
