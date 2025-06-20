(function($) {
    let urlParams = new URLSearchParams(window.location.search);
    let token = urlParams.get('token');

    if (token) {
        localStorage.setItem("token", token);
    }

    token = localStorage.getItem("token");

    if (token) {
        $.ajaxSetup({
            beforeSend: function (xhr)
            {
                xhr.setRequestHeader("Authorization", `Bearer ${token}`);
            }
        });
    }

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
        'show_all_results': {
            'de' : 'Alle anzeigen',
            'en' : 'Show all'
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
        'sex': {
            'de' : 'Geschlecht',
            'en' : 'Gender'
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
                    $(this).text($(this).data('text-profile')) //set the profile text, eg. "Mein Profil"
                        .attr('href',settings.appUrl+'/tour/'+settings.slug+'/profile'); //set the support url

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
                    401: function() { //unauthorized - not logged in

                        console.log("me.json unauthorized - not logged in");

                        $('.laceup-show-if-paid-user').hide();
                        $('.laceup-show-if-free-user').hide();
                        $('.laceup-show-if-known-user').hide();
                        $('.laceup-show-if-unknown-user').show();

                    },
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
                            '<div class="profile-img" style="background-image: url('+val.node.athlete.profile+'), url(https://static.laceup.ch/backgrounds/Running1.jpg);">' +
                                (val.node.athlete.paid ?
                                    '<a title="'+translate('supporter')+'" href="'+settings.appUrl+'/tour/'+settings.slug+'/donate"><img class="paid-badge" src="'+settings.paidBadgeURL+'"></a>' :
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

                            var itemHTML = '<div class="result-item result-rank-'+ranking.rank+'">'+
                                '<div class="result-rank '+(ranking.athlete.paid ? 'result-rank-paid' : '')+'"><div>'+ranking.rank+'</div></div>'+
                                '<div class="result-name truncate">'+
                                ranking.athlete.name+
                                '<br><small class="paragraph-light paragraph-small">'+ranking.number_of_stages+' Etappe(n)</small>'+
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
            paidBadgeURL :'https://nicoschefer.github.io/laceup-jq/img/paid-badge.svg'
        }, this.data(), options); //extend from the meta data properties and options variable (to set a different mainSelector)


        this.loadContent = function() {

            $(settings.mainSelector+':not([data-stageid=""])').each(function(index, el) {

                var eleSettings = $.extend({}, settings, $(el).data()); //check the elements data attribute for further settings

                $(el).DataTable({
                    "retrieve": true,
                    "ajax": {
                        url: eleSettings.appUrl+"/api/rankings?stage.id="+$(el).data('stageid')+"&sex="+$(el).data('sex'),
                        dataSrc: ""
                    },
                    "processing": true,
                    "conditionalPaging": true,
                    "lengthMenu": [[100, -1], [100, translate('show_all_results')]],
                    "ordering": false,
                    "searching": false,
                    "info": false,
                    "columns": [
                        { "title": "Rang", "data": "rank" },
                        {
                            "title": "",
                            "data": "athlete.profile",
                            "render": function(data, type, row) {

                                return '<div class="ranking-profile '+(row.athlete.paid ? 'ranking-profile-paid' : '')+'">'+
                                            '<div class="profile-img" style="background-image: url('+data+'), url(https://static.laceup.ch/backgrounds/Running1.jpg);">'+
                                                (row.athlete.paid ?
                                                    ('<a class="ranking-paid-badge" title="'+translate('supporter')+'" href="'+eleSettings.appUrl+'/tour/'+eleSettings.slug+'/donate"><img class="paid-badge" src="'+eleSettings.paidBadgeURL+'"></a>') :
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
                                            '<div class="profile-img" style="background-image: url('+data+'), url(https://static.laceup.ch/backgrounds/Running1.jpg);">'+
                                                (row.athlete.paid ? '<a title="'+translate('supporter')+'" href="'+eleSettings.appUrl+'/tour/'+eleSettings.slug+'/donate"><img class="paid-badge" src="'+eleSettings.paidBadgeURL+'"></a>' : '')+
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
                var availableBadges = (eleSettings.badges !== undefined) ? eleSettings.badges.split(',').filter(element => element) : ["hare","bat","bee"];

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
                                    '<div class="profile-img" style="background-image: url('+data+'), url(https://static.laceup.ch/backgrounds/Running1.jpg);">'+
                                    (row.athlete.paid ? '<a title="'+translate('supporter')+'" href="'+eleSettings.appUrl+'/tour/'+eleSettings.slug+'/donate"><img class="paid-badge" src="'+eleSettings.paidBadgeURL+'"></a>' : '')+
                                    '</div>'+
                                    '</div>';

                            }
                        },
                        {
                            "title": translate('athlete.name'),
                            "data": "athlete.name",
                            "render": function(name, type, row) {
                                return '<a style="text-decoration: none;" href="'+row.athlete.oauth_link+'" target="_blank">'+name+'</a>' +
                                    (row.athlete.paid ? '<img class="paid-badge-inline" src="'+eleSettings.paidBadgeURL+'">' : '');
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
                        { responsivePriority: 1, targets: 0, width: '10%' }, // rank
                        { responsivePriority: 4, targets: 1, width: '10%' }, // profile
                        { responsivePriority: 1, targets: 2, width: '70%' }, // name
                        { responsivePriority: 6, targets: 3, width: '5%' }, // stages
                        { responsivePriority: 2, targets: 4, width: '10%' }, // badges
                        { responsivePriority: 1, targets: 5, className: 'dt-body-right', width: '10%' }, // time
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


    /**
     * jQuery plug-in: laceUpStageTrophy
     * – now loads *all* pages before initialising DataTables
     *   (keeps requesting ...&page=N&itemsPerPage=50 until <50 rows are returned)
     */
    $.fn.laceUpStageTrophy = function (options) {

        const settings = $.extend({
            mainSelector: '.laceup-trophy-stage',
            paidBadgeURL: 'https://nicoschefer.github.io/laceup-jq/img/paid-badge.svg'
        }, this.data(), options);

        /* --------------------------------------------------------- */
        this.loadContent = function () {

            $(settings.mainSelector + ':not([data-stageid=""])').each(function (_, el) {

                const eleSettings = $.extend({}, settings, $(el).data());
                const itemsPerPage = 50;

                // base part of the API – only the page number changes
                const baseURL =
                    `${eleSettings.appUrl}/api/rankings`
                    + `?stage.id=${$(el).data('stageid')}`
                    + `&sex=${$(el).data('sex')}`
                    + `&itemsPerPage=${itemsPerPage}`;

                /* -------- recursive loader ---------------------------------- */
                function fetchPage(page = 1, acc = []) {
                    return $.getJSON(`${baseURL}&page=${page}`).then(res => {
                        if (Array.isArray(res) && res.length) {
                            acc.push(...res);
                            // another page is *possible* only when results == itemsPerPage
                            if (res.length === itemsPerPage) {
                                return fetchPage(page + 1, acc);
                            }
                        }
                        return acc; // either ran out of rows or received empty page
                    });
                }

                /* -------- grab everything, then initialise DataTable -------- */
                fetchPage().then(fullData => {

                    $(el).DataTable({
                        retrieve: true,
                        data: fullData,          // <-- was "ajax" before
                        processing: true,
                        conditionalPaging: true,
                        lengthMenu: [[100, -1], [100, translate('show_all_results')]],
                        ordering: false,
                        searching: false,
                        info: false,
                        language: {
                            "emptyTable": translate('no_results')
                        },
                        columns: [
                            {
                                title: "",
                                data: "athlete.profile",
                                render: function (data, type, row) {
                                    return `<div class="ranking-profile ${(row.athlete.paid ? 'ranking-profile-paid' : '')}">
                                            <div class="profile-img"
                                                 style="background-image:url(${data}),url(https://static.laceup.ch/backgrounds/Running1.jpg);">
                                                 ${row.athlete.paid
                                        ? `<a class="ranking-paid-badge" title="${translate('supporter')}"
                                                           href="${eleSettings.appUrl}/tour/${eleSettings.slug}/donate">
                                                           <img class="paid-badge" src="${eleSettings.paidBadgeURL}">
                                                       </a>` : ''}
                                            </div>
                                        </div>`;
                                }
                            },
                            {
                                title: "Name",
                                data: "athlete.name",
                                render: (name, type, row) =>
                                    `<a style="text-decoration:none;" href="${row.athlete.oauth_link}" target="_blank">${name}</a>`
                            },
                            {
                                title: "Datum",
                                data: "effort.start_date",
                                render: (d, type, row) =>
                                    `<a style="font-family:monospace;text-decoration:none;" target="_blank"
                                     href="${row.effort.effort_strava_link}">
                                     ${new Date(d).toLocaleDateString('de-CH')}
                                 </a>`
                            }
                        ],
                        columnDefs: [
                            { targets: 0, width: '10%' },
                            { targets: 1, width: '45%' },
                            { targets: 2, className: 'dt-body-right', width: '45%' }
                        ]
                    }).on('page.dt', function () {
                        $('html, body').animate({ scrollTop: $(el).offset().top }, 'fast');
                    });

                }).fail(err => console.error('Rankings fetch failed:', err));
            });

            return this;
        };
        /* --------------------------------------------------------- */

        return this.loadContent();
    };


    $.fn.laceUpTrophyRanking = function(options) {

        this.laceUpOverallTrophyStageCompletion(options);
    };


    $.fn.laceUpOverallTrophyStageCompletion = function(options) {

        var settings = $.extend({
            mainSelector: '.laceup-trophy-ranking',
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
                    var availableBadges = (eleSettings.badges !== undefined) ? eleSettings.badges.split(',').filter(element => element) : ["bee","bat","hare"];

                    var apiURL = eleSettings.appUrl + "/api/trophies.json?tour.slug="+eleSettings.slug+"&type=stage_completion&sex="+eleSettings.sex+"&"+(eleSettings.limit?'itemsPerPage='+eleSettings.limit:'pagination=false');

                    console.log(apiURL);

                    $.getJSON(apiURL, function(response) {

                            $(el).empty();

                            $.each(response, function( key, val ) {

                                console.log(val.data);

                                //Note: if no stage, array [0]
                                if(!val.data.distinct_stage_ids.length || val.data.distinct_stage_ids[0] === null){
                                    return false; //break $.each
                                }

                                var athBadges = extractBadges(val.athlete.badges);
                                var badgesHtml = '';

                                //Possible completion batch to show how many / if all completed
                                badgesHtml += '<div class="achieved-badge completion completed-n-'+val.data.distinct_stage_ids.length+'"></div>';

                                $.each(availableBadges, function(key, thisBadge ) {

                                    var isPassive = athBadges.includes(thisBadge) ? '' : 'achieved-badge-passive';
                                    badgesHtml += '<div class="achieved-badge '+isPassive+' '+thisBadge+'"></div>';

                                });

                                var stagesHTML = '';
                                $.each(val.data.distinct_stage_ids, function(key, stageId) {
                                    if(stageId){
                                        stagesHTML += '<div role="img" class="trophy-stage-badge trophy-stage-id-'+stageId+'" title="'+stagesDataById['stage-'+stageId].name+'"></div>';
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
            limit: 1000
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

    $.fn.laceUpStarter = function(options) {

        var settings = $.extend({
            mainSelector: '.laceup-starter',
            paidBadgeURL :'https://nicoschefer.github.io/laceup-jq/img/paid-badge.svg'
        }, this.data(), options); //extend from the meta data properties and options variable (to set a different mainSelector)


        this.loadContent = function() {

            var apiURL = settings.appUrl+"/api/athletes.json?tour.slug="+settings.slug+"&pagination=false"+"&sex="+$(settings).data('sex');

            console.log(apiURL);

            $(settings.mainSelector).DataTable({
                "retrieve": true,
                "ajax": {
                    url: apiURL,
                    dataSrc: ""
                },
                "processing": true,
                "conditionalPaging": true,
                "lengthMenu": [[100, -1], [100, "Alle Teilnehmer"]],
                "ordering": true,
                order: [[1, 'asc']], //Default ordering (colIndex)
                "searching": false,
                "info": false,
                "language": {
                    "emptyTable": translate('no_results')
                },
                "columns": [
                    {
                        "title": "",
                        "data": "profile",
                        "render": function(data, type, row) {

                            return '<div class="ranking-profile '+(row.paid ? 'ranking-profile-paid' : '')+'">'+
                                '<div class="profile-img" style="background-image: url('+data+'), url(https://static.laceup.ch/backgrounds/Running1.jpg);">'+
                                (row.paid ?
                                    ('<a class="ranking-paid-badge" title="'+translate('supporter')+'" href="'+settings.appUrl+'/tour/'+settings.slug+'/donate"><img class="paid-badge" src="'+settings.paidBadgeURL+'"></a>') :
                                    '')+
                                '</div>'+
                                '</div>';
                        }
                    },
                    {
                        "title": "Name",
                        "data": "name",
                        "render": function(name, type, row) {
                            return '<a style="text-decoration: none;" href="'+row.oauth_link+'" target="_blank">'+name+'</a>';
                        }
                    }
                ],
                columnDefs: [
                    { targets: 0, width: '20%' },
                    { targets: 1, width: '80%' },
                ]
            }).on('page.dt', function() { //on pagination click, scroll to top of the table
                $('html, body').animate({
                    scrollTop: $(this).offset().top
                }, 'fast');
            });

            return this;

        };

        this.loadContent();

        return this;

    };


    //https://app.laceup.io/api/stages/50.json


})(jQuery);
