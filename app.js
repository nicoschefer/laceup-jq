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



    $.fn.laceUpStageRanking = function (options) {

        const settings = $.extend({
            mainSelector: '.laceup-stageranking',
            paidBadgeURL: 'https://nicoschefer.github.io/laceup-jq/img/paid-badge.svg'
        }, this.data(), options);

        this.loadContent = function () {

            $(settings.mainSelector + ':not([data-stageid=""])').each(function (_, el) {

                const eleSettings = $.extend({}, settings, $(el).data());
                const itemsPerPage = 50;

                const baseURL =
                    `${eleSettings.appUrl}/api/rankings`
                    + `?stage.id=${$(el).data('stageid')}`
                    + `&sex=${$(el).data('sex')}`
                    + `&itemsPerPage=${itemsPerPage}`;

                function fetchPage(page = 1, acc = []) {
                    return $.getJSON(`${baseURL}&page=${page}`).then(res => {
                        if (Array.isArray(res) && res.length) {
                            acc.push(...res);
                            if (res.length === itemsPerPage) {
                                return fetchPage(page + 1, acc);
                            }
                        }
                        return acc;
                    });
                }

                fetchPage().then(fullData => {

                    $(el).DataTable({
                        retrieve: true,
                        data: fullData, // <- full list of results
                        processing: true,
                        conditionalPaging: true,
                        lengthMenu: [[100, -1], [100, translate('show_all_results')]],
                        ordering: false,
                        searching: false,
                        info: false,
                        columns: [
                            { title: "Rang", data: "rank" },
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
                                render: function (name, type, row) {
                                    return `<a style="text-decoration: none;" href="${row.athlete.oauth_link}" target="_blank">${name}</a>`;
                                }
                            },
                            {
                                title: "Zeit",
                                data: "ranking_time",
                                render: function (data, type, row) {
                                    return `<a style="font-family: monospace; text-decoration: none;" target="_blank"
                                           href="${row.effort.effort_strava_link}">${data}</a>`;
                                }
                            }
                        ],
                        columnDefs: [
                            { targets: 0, width: '5%' },
                            { targets: 1, width: '10%' },
                            { targets: 2, width: '50%' },
                            { targets: -1, className: 'dt-body-right', width: '35%' }
                        ]
                    }).on('page.dt', function () {
                        $('html, body').animate({
                            scrollTop: $(el).offset().top
                        }, 'fast');
                    });

                }).fail(err => console.error('Ranking fetch failed:', err));
            });

            return this;
        };

        return this.loadContent();
    };



    $.fn.laceUpOverallRanking = function (options) {

        const settings = $.extend({
            mainSelector: '.laceup-ranking',
            paidBadgeURL: 'https://nicoschefer.github.io/laceup-jq/img/paid-badge.svg'
        }, this.data(), options);

        this.loadContent = function () {

            $(settings.mainSelector).each(function (_, el) {

                const eleSettings = $.extend({}, settings, $(el).data());
                const itemsPerPage = 50;

                const baseURL =
                    `${eleSettings.appUrl}/api/overall_rankings`
                    + `?tour.slug=${eleSettings.slug}`
                    + `&sex=${$(el).data('sex') || ''}`
                    + `&itemsPerPage=${itemsPerPage}`;

                function fetchPage(page = 1, acc = []) {
                    return $.getJSON(`${baseURL}&page=${page}`).then(res => {
                        if (Array.isArray(res) && res.length) {
                            acc.push(...res);
                            if (res.length === itemsPerPage) {
                                return fetchPage(page + 1, acc);
                            }
                        }
                        return acc;
                    });
                }

                fetchPage().then(fullData => {

                    $(el).DataTable({
                        retrieve: true,
                        data: fullData,
                        processing: true,
                        paging: false,
                        ordering: false,
                        searching: false,
                        info: false,
                        responsive: true,
                        language: {
                            emptyTable: translate('no_results')
                        },
                        columns: [
                            { title: "", data: "rank" },
                            {
                                title: "",
                                data: "athlete.profile",
                                render: function (data, type, row) {
                                    return `<div class="ranking-profile ${row.athlete.paid ? 'ranking-profile-paid' : ''}">
                                            <div class="profile-img"
                                                 style="background-image: url(${data}), url(https://static.laceup.ch/backgrounds/Running1.jpg);">
                                                ${row.athlete.paid
                                        ? `<a title="${translate('supporter')}" href="${eleSettings.appUrl}/tour/${eleSettings.slug}/donate">
                                                        <img class="paid-badge" src="${eleSettings.paidBadgeURL}">
                                                       </a>` : ''}
                                            </div>
                                        </div>`;
                                }
                            },
                            {
                                title: "Name",
                                data: "athlete.name",
                                render: function (name, type, row) {
                                    return `<a style="text-decoration: none;" href="${row.athlete.oauth_link}" target="_blank">${name}</a>`;
                                }
                            },
                            {
                                title: "Etappen",
                                data: "number_of_stages"
                            },
                            {
                                title: "Zeit",
                                data: "ranking_time",
                                render: data => `<span class="ranking-time">${data}</span>`
                            },
                            {
                                title: "Rückstand",
                                render: function (_, type, row) {
                                    let lag = "";
                                    if (row.rank > 1 && row.stage_lag === 0) {
                                        lag = row.time_to_first_formatted;
                                    }
                                    return `<span class="ranking-time ranking-time-back">${lag}</span>`;
                                }
                            }
                        ],
                        columnDefs: [
                            { responsivePriority: 1, targets: 0, width: '5%' },
                            { responsivePriority: 2, targets: 1, width: '10%' },
                            { responsivePriority: 3, targets: 2, width: '60%' },
                            { responsivePriority: 6, targets: 3, width: '5%' },
                            { responsivePriority: 4, targets: 4, className: 'dt-body-right', width: '10%' },
                            { responsivePriority: 5, targets: 5, className: 'dt-body-right', width: '10%' }
                        ],
                        drawCallback: function () {
                            const api = this.api();
                            const rows = api.rows({ page: 'current' }).nodes();
                            let last = null;
                            api.column(3, { page: 'current' }).data().each(function (group, i) {
                                if (last !== group) {
                                    $(rows).eq(i).before(
                                        `<tr style="text-align: center;"><td colspan="6"><small>${group} Etappe(n)</small></td></tr>`
                                    );
                                    last = group;
                                }
                            });
                        }
                    });

                }).fail(err => console.error('Overall ranking fetch failed:', err));
            });

            return this;
        };

        return this.loadContent();
    };


    $.fn.laceUpOverallRankingWithBadges = function (options) {

        const settings = $.extend({
            mainSelector: '.laceup-ranking',
            paidBadgeURL: 'https://nicoschefer.github.io/laceup-jq/img/paid-badge.svg'
        }, this.data(), options);

        this.loadContent = function () {

            $(settings.mainSelector).each(function (_, el) {

                const eleSettings = $.extend({}, settings, $(el).data());
                const itemsPerPage = 50;

                const baseURL =
                    `${eleSettings.appUrl}/api/overall_rankings`
                    + `?tour.slug=${eleSettings.slug}`
                    + `&sex=${$(el).data('sex') || ''}`
                    + `&itemsPerPage=${itemsPerPage}`;

                const availableBadges = (eleSettings.badges !== undefined)
                    ? eleSettings.badges.split(',').filter(Boolean)
                    : ["hare", "bat", "bee"];

                function fetchPage(page = 1, acc = []) {
                    return $.getJSON(`${baseURL}&page=${page}`).then(res => {
                        if (Array.isArray(res) && res.length) {
                            acc.push(...res);
                            if (res.length === itemsPerPage) {
                                return fetchPage(page + 1, acc);
                            }
                        }
                        return acc;
                    });
                }

                fetchPage().then(fullData => {

                    $(el).DataTable({
                        retrieve: true,
                        data: fullData,
                        processing: true,
                        paging: false,
                        ordering: false,
                        searching: false,
                        info: false,
                        responsive: true,
                        language: {
                            emptyTable: translate('no_results')
                        },
                        columns: [
                            { title: "", data: "rank" },
                            {
                                title: "",
                                data: "athlete.profile",
                                render: function (data, type, row) {
                                    return `<div class="ranking-profile ${(row.athlete.paid ? 'ranking-profile-paid' : '')}">
                                            <div class="profile-img"
                                                 style="background-image: url(${data}), url(https://static.laceup.ch/backgrounds/Running1.jpg);">
                                                ${row.athlete.paid
                                        ? `<a title="${translate('supporter')}" href="${eleSettings.appUrl}/tour/${eleSettings.slug}/donate">
                                                            <img class="paid-badge" src="${eleSettings.paidBadgeURL}">
                                                       </a>`
                                        : ''}
                                            </div>
                                        </div>`;
                                }
                            },
                            {
                                title: translate('athlete.name'),
                                data: "athlete.name",
                                render: function (name, type, row) {
                                    return `<a style="text-decoration: none;" href="${row.athlete.oauth_link}" target="_blank">${name}</a>`
                                        + (row.athlete.paid
                                            ? `<img class="paid-badge-inline" src="${eleSettings.paidBadgeURL}">`
                                            : '');
                                }
                            },
                            {
                                title: translate('number_of_stages'),
                                data: "number_of_stages"
                            },
                            {
                                title: translate('badges'),
                                render: function (_, type, row) {
                                    const athBadges = extractBadges(row.athlete.badges || []);
                                    return `<div class="badge-container">` +
                                        availableBadges.map(badge =>
                                            `<div class="achieved-badge ${athBadges.includes(badge) ? '' : 'achieved-badge-passive'} ${badge}"></div>`
                                        ).join('') +
                                        `</div>`;
                                }
                            },
                            {
                                title: translate('ranking_time'),
                                data: "ranking_time",
                                render: data => `<span class="ranking-time">${data}</span>`
                            },
                            {
                                title: translate('time_back'),
                                render: function (_, type, row) {
                                    let lag = "";
                                    if (row.rank > 1 && row.stage_lag === 0) {
                                        lag = row.time_to_first_formatted;
                                    }
                                    return `<span class="ranking-time ranking-time-back">${lag}</span>`;
                                }
                            }
                        ],
                        columnDefs: [
                            { responsivePriority: 1, targets: 0, width: '10%' },
                            { responsivePriority: 4, targets: 1, width: '10%' },
                            { responsivePriority: 1, targets: 2, width: '70%' },
                            { responsivePriority: 6, targets: 3, width: '5%' },
                            { responsivePriority: 2, targets: 4, width: '10%' },
                            { responsivePriority: 1, targets: 5, className: 'dt-body-right', width: '10%' },
                            { responsivePriority: 5, targets: 6, className: 'dt-body-right', width: '10%' }
                        ],
                        drawCallback: function () {
                            const api = this.api();
                            const rows = api.rows({ page: 'current' }).nodes();
                            let last = null;
                            api.column(3, { page: 'current' }).data().each(function (group, i) {
                                if (last !== group) {
                                    $(rows).eq(i).before(
                                        `<tr style="text-align: center;"><td colspan="7"><small>${group} ${translate('n_stages')}</small></td></tr>`
                                    );
                                    last = group;
                                }
                            });
                        }
                    });

                }).fail(err => console.error('Overall ranking fetch failed:', err));
            });

            return this;
        };

        return this.loadContent();
    };


    $.fn.laceUpSupporter = function (options) {

        const settings = $.extend({
            mainSelector: '#laceup-supporter',
            refreshSeconds: 480,
            limit: 1000
        }, this.data(), options);

        $.extend(settings, $(settings.mainSelector).data());

        this.loadContent = function () {

            const itemsPerPage = 50;
            const baseURL = `${settings.appUrl}/api/athletes.json?tour.slug=${settings.slug}&paid=true&itemsPerPage=${itemsPerPage}`;

            const blockedIds = [3129449, 9959175, 16814702]; // Strava IDs of Nico, Sebastian, Tobias

            function fetchPage(page = 1, acc = []) {
                return $.getJSON(`${baseURL}&page=${page}`).then(res => {
                    if (Array.isArray(res) && res.length) {
                        acc.push(...res);
                        if (res.length === itemsPerPage) {
                            return fetchPage(page + 1, acc);
                        }
                    }
                    return acc;
                });
            }

            fetchPage().then(allSupporters => {
                $(settings.mainSelector).empty();

                // Shuffle the array (Fisher-Yates would be cleaner, but this is acceptable)
                const shuffled = allSupporters.sort(() => Math.random() - 0.5);

                let count = 0;

                $.each(shuffled, function (_, val) {
                    if (blockedIds.includes(val.oauth_id)) return;
                    if (count >= settings.limit) return false; // break loop

                    const html = `<a href="${val.oauth_link}" class="link-inline" target="_blank">${val.name}</a> `;
                    $(settings.mainSelector).append(html);
                    count++;
                });

            }).fail(err => console.error('Supporters fetch failed:', err));

            return this;
        };

        function triggerRefresh($that) {
            if (settings.refreshSeconds > 0) {
                setInterval(() => {
                    $that.loadContent();
                }, settings.refreshSeconds * 1000);
            }
        }

        if ($(settings.mainSelector).length) {
            triggerRefresh(this);
            this.loadContent();
        }

        return this;
    };

    $.fn.laceUpStarter = function (options) {

        const settings = $.extend({
            mainSelector: '.laceup-starter',
            paidBadgeURL: 'https://nicoschefer.github.io/laceup-jq/img/paid-badge.svg',
            sex: ''           // can be overridden via options or data-attrs
        }, this.data(), options);

        /* --------------------------------------------------------- */
        this.loadContent = function () {

            const itemsPerPage = 50;
            const baseURL =
                `${settings.appUrl}/api/athletes.json`
                + `?tour.slug=${settings.slug}`
                + `&itemsPerPage=${itemsPerPage}`
                + (settings.sex ? `&sex=${settings.sex}` : '');

            /* ---------- recursive loader -------------------------- */
            function fetchPage(page = 1, acc = []) {
                return $.getJSON(`${baseURL}&page=${page}`).then(res => {
                    if (Array.isArray(res) && res.length) {
                        acc.push(...res);
                        if (res.length === itemsPerPage) {
                            return fetchPage(page + 1, acc);   // another page likely
                        }
                    }
                    return acc; // finished
                });
            }

            /* ---------- after all data arrived -------------------- */
            fetchPage().then(fullData => {

                $(settings.mainSelector).DataTable({
                    retrieve: true,
                    data: fullData,                    // << aggregated rows
                    processing: true,
                    conditionalPaging: true,
                    lengthMenu: [[100, -1], [100, "Alle Teilnehmer"]],
                    ordering: true,
                    order: [[1, 'asc']],
                    searching: false,
                    info: false,
                    language: { emptyTable: translate('no_results') },
                    columns: [
                        {
                            title: "",
                            data: "profile",
                            render: function (data, type, row) {
                                return `<div class="ranking-profile ${(row.paid ? 'ranking-profile-paid' : '')}">
                                        <div class="profile-img"
                                             style="background-image:url(${data}),url(https://static.laceup.ch/backgrounds/Running1.jpg);">
                                             ${row.paid
                                    ? `<a class="ranking-paid-badge" title="${translate('supporter')}"
                                                       href="${settings.appUrl}/tour/${settings.slug}/donate">
                                                       <img class="paid-badge" src="${settings.paidBadgeURL}">
                                                   </a>` : ''}
                                        </div>
                                    </div>`;
                            }
                        },
                        {
                            title: "Name",
                            data: "name",
                            render: (name, type, row) =>
                                `<a style="text-decoration:none;" href="${row.oauth_link}" target="_blank">${name}</a>`
                        }
                    ],
                    columnDefs: [
                        { targets: 0, width: '20%' },
                        { targets: 1, width: '80%' }
                    ]
                }).on('page.dt', function () {
                    $('html, body').animate({
                        scrollTop: $(this).offset().top
                    }, 'fast');
                });

            }).fail(err => console.error('Athletes fetch failed:', err));

            return this;
        };
        /* --------------------------------------------------------- */

        return this.loadContent();
    };



    //https://app.laceup.io/api/stages/50.json


})(jQuery);
