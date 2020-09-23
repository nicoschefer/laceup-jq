(function($) {

    $.fn.laceUpUserStatus = function(options) {

        var settings = $.extend({
            refreshSeconds: 240,
            supportSelector: 'div.support',
            joinSelector: 'div.join',
            supportNameSelector: '.supportname',
            signupBtnSelector: '.signupbutton'
        }, this.data(), options); //extend from the meta data properties and options variable (to set a different mainSelector)

        var handleJoin = function(data){

            if(data.id){

                $(settings.joinSelector).hide(); //has already joined

                if(!data.paid) { //but not supported:

                    $(settings.supportSelector).show();

                }
            }

        };

        var handleSupportName = function(data){

            if(data.id){

                $(settings.supportNameSelector).each(function() {

                    $(this).text($(this).text().replace('$$firstname$$', data.firstname));

                });
            }

        };

        var handleSignupButton = function(data){

            $(settings.signupBtnSelector).each(function() {

                if(!$(this).data('href-original')){ //only do this the first time
                    $(this).data('href-original',$(this).attr('href'));
                }

                if(data.paid){

                    $(this)
                        .text($(this).data('text-profile')) //set the profile text, eg. "Mein Profil"
                        .attr('href',$(this).data('href-original')); //set the original URL (not the support url)

                }
                else{

                    $(this)
                        .text($(this).data('text-support'))
                        .attr('href',$(this).data('href-original').replace('/connect','/donate')); //set the support url

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
                success: function(data) {

                    if(data.tour.slug === settings.slug){

                        handleJoin(data);
                        handleSupportName(data);
                        handleSignupButton(data);

                    }
                    else{

                        console.log("me.json: Tour slug mismatch");

                    }

                },
                error: function(data) {

                    console.log("Error:");
                    console.log(data);

                    return data;
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

        this.loadContent = function() {

            $.ajax({url: settings.appUrl + "/api/graphql",
                contentType: "application/json",
                type:'POST',
                data: JSON.stringify({ query:`{
                    efforts(
                      last: `+settings.lastActivities+`,
                      order: {start_date: "asc"},
                      stage_tour_slug: "`+settings.slug+`",
                      start_date: {after: "`+settings.fromDate+`", before: "`+settings.toDate+`"}
                      ) {
                      edges {
                        node {
                          strava_id
                          start_date
                          ranking_time
                          effort_strava_link
                          elapsed_time
                          stage {
                            name
                            segment
                          }
                          ranking {
                            rank
                          }
                          athlete {
                            bib
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

                        $(htmlScaffold).data('strava-id', val.node.strava_id); //allows us to identify the item

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
                    url: eleSettings.appUrl + "/api/graphql",
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
                            var ranking = val.node;
                            var lag = "";
                            if (ranking.stage_lag > 0) {
                                lag = "+" + ranking.stage_lag + " Etappe(n)";
                            } else if (key > 0) {
                                lag = "+" + ranking.time_to_first_formatted;
                            }

                            var itemHTML = '<div class="result-item result-rank-'+(key+1)+'">'+ //don't use val.rank, as this could be a shared rank (rank 1, 1, 3)
                                '<div class="result-rank"><div>'+ranking.rank+'</div></div>'+
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

            $(settings.mainSelector).each(function(index, el) { //data-sex="F", data-sex="M", .podium-strava-segment-id (div element containing the strava segment id), data-limit="3"

                var eleSettings = $.extend({}, settings, $(el).data()); //check the elements data attribute for further settings

                var stravaSegmentId = $(el).closest('.podium-item').find('.podium-strava-segment-id').html(); //Webflow workaround: not possible to populate a data- attribute from a collection

                $.getJSON(
                    eleSettings.appUrl + "/api/rankings?stage.segment="+stravaSegmentId+"&sex="+$(el).data('sex')+"&itemsPerPage="+eleSettings.limit,
                    function(response) {

                        $.each(response, function( key, val ) {

                            var lbItem = $(el).find('.result-rank-'+(key+1)); //don't use val.rank, as this could be a shared rank (rank 1, 1, 3)
                            //var timeBack = (key>0 && val.ranking_time_seconds) ? "+"+new Date((val.ranking_time_seconds - response.data[0].ranking_time_seconds) * 1000).toISOString().substr(11, 8) : '';

                            $(lbItem).find('.result-rank > div').html(val.rank);
                            $(lbItem).find('.result-name').html(val.athlete.name);
                            $(lbItem).find('.result-time').html('<a style="font-family: monospace; text-decoration: none;" target="_blank" href="'+val.effort.effort_strava_link+'">'+val.ranking_time+'</a>');


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

            $(settings.mainSelector+':not([data-segment=""])').each(function(index, el) {

                var eleSettings = $.extend({}, settings, $(el).data()); //check the elements data attribute for further settings

                $(el).DataTable({
                    "ajax": {
                        url: eleSettings.appUrl+"/api/rankings?stage.segment="+$(el).data('segment')+"&sex="+$(el).data('sex')+"&pagination=false",
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
                                return '<a style="text-decoration: none;" href="https://strava.com/athletes/'+row.athlete.strava_id+'" target="_blank">'+name+'</a>';
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
                        { "title": "", "data": "rank" },
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
                                return '<a style="text-decoration: none;" href="https://strava.com/athletes/'+row.athlete.strava_id+'" target="_blank">'+name+'</a>';
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
                                if (row.rank > 1 && row.stage_lag == 0) {
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
                                    '<tr style="text-align: center;"><td colspan="6">'+group+' Etappe(n)</td></tr>'
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

    $.fn.laceUpSupporter = function(options) {

        var settings = $.extend({
            mainSelector: '#laceup-supporter',
            refreshSeconds: 480,
            limit: 100
        }, this.data(), options); //extend from the meta data properties and options variable (to set a different mainSelector)

        this.loadContent = function() {

            $.ajax({
                url: settings.appUrl+"/api/athletes.json?tour.slug="+settings.slug+"&paid=true&pagination=false",
                type: 'GET',
                dataType: 'json',
                success: function(supporterResponse) {

                    $(settings.mainSelector).html("");

                    $.each(supporterResponse, function( key, val ) {

                        $(settings.mainSelector).append("<a href='https://www.strava.com/athletes/"+val.strava_id+"' class='link-inline' target='_blank'>"+val.firstname+" "+val.lastname+"</a> ");

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


})(jQuery);


$(document).ready( function () {

    //jump to newsticker after pagination click (instead of top)
    $('#newsticker .w-pagination-wrapper a').each(function() {
        $(this).attr('href',	$(this).attr('href')+'#newsticker');
    });

});
