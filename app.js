$(document).ready( function () {

    globalAppURL = $('#laceup-meta').data('app-url');
    globalTourSlug = $('#laceup-meta').data('slug');

    setInterval(function updateLoginStatus() { //reload automatically

        function updateLoginStatus() {

            $.ajax({
                url: globalAppURL+"/api/me.json",
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

                    //console.log(data);
                    console.log("updateLoginStatus: get me.json success");

                    if(data.tour.slug == globalTourSlug){


                        $("div.join").hide(); //has already joined

                        if(!data.paid){ //but not supported:

                            $(".supportname").each(function() {

                                $(this).text($(this).text().replace('<firstname>', data.firstname));

                            });

                            $("div.support").show();
                        }


                        $(".signupbutton").each(function() {

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
                                ;

                            }

                        });
                    }
                    else{

                        console.log("me.json: Tour slug mismatch");

                    }

                },
                error: function(data) {
                    console.log(data);
                }
            });


        }

        return updateLoginStatus; //return the function to execute it on initial start

    }(), 1000*120); //milliseconds


    //Load recent results
    setInterval(function updateRecentResults() { //reload automatically
        $.ajax({url: globalAppURL+"/api/graphql",
            contentType: "application/json",type:'POST',
            data: JSON.stringify({ query:`{
        efforts(
        	last: 20,
          order: {start_date: "asc"},
          stage_tour_slug: "`+globalTourSlug+`",
          start_date: {after: "2020-09-14", before: "2020-10-12"}
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

                console.log(result);

                var htmlScaffold = $('#recent-activities .recent-item').first().clone();

                $('#recent-activities .recent-item').remove(); //start empty

                $.each(result.data.efforts.edges, function( key, val ) {

                    //var effortTimeAgo = moment(val.node.start_date).add(val.node.elapsed_time,'seconds').fromNow();
                    var effortTimeAgo = moment(val.node.start_date).fromNow();
                    //allows us to identify the item
                    $(htmlScaffold).data('strava-id', val.node.strava_id);

                    if(val.node.athlete.paid){
                        $(htmlScaffold).addClass('recent-item-paid');
                    }
                    else{
                        $(htmlScaffold).removeClass('recent-item-paid');
                    }

                    $(htmlScaffold).find('.recent-profile').html("<div class=\"profile-img\" style=\"width: 32px; height: 32px; border-radius: 50%; background-position: center; background-size: cover; background-image: url("+val.node.athlete.profile+");\"></div>"+(val.node.athlete.paid ? '<a title="Unterstützer" href="'+globalAppURL+'/tour/'+globalTourSlug+'/donate">'+paidSVGBadge+'</a>' : ''));
                    $(htmlScaffold).find('.recent-date').html(effortTimeAgo);
                    $(htmlScaffold).find('.recent-name').html(val.node.athlete.name);
                    $(htmlScaffold).find('.recent-stage').html(val.node.stage.name.replace("TdU: ", "").replace("Tdu: ", ""));

                    var recentRankingClass = (val.node.ranking !== null && val.node.ranking.rank <= 3) ? "recent-ranking-"+val.node.ranking.rank : '';
                    var recentRankingTitle = (val.node.ranking !== null) ? val.node.ranking.rank : 'n/a';
                    $(htmlScaffold).find('.recent-time').html("<a target=\"_blank\" href=\""+val.node.effort_strava_link+"\" title=\"Rang "+recentRankingTitle+"\"><span class=\"recent-ranking "+recentRankingClass+"\">"+val.node.ranking_time+"</span></a>");

                    //create a clone and add ot on top of the other items
                    $('#recent-activities .recent-wrapper').prepend(htmlScaffold.clone());

                });


            } /*end success(){}*/
        });

        return updateRecentResults; //return the function to execute it on initial start

    }(), 1000*180); //milliseconds

    //Load overall leaderboard results
    setInterval(function updateLeaderboard() { //reload automatically

        $('.leaderboard').each(function(index, el) { //data-sex="F", data-sex="M" | data-limit="10"

            $(el).html('');

            $.ajax({
                url: globalAppURL+"/api/graphql",
                contentType: "application/json",
                type: 'POST',
                data: JSON.stringify({
                    query:
                        `{
  overallRankings(tour_slug: "`+globalTourSlug+`", sex: "`+$(el).data('sex')+`", first: `+$(el).data('limit')+`) {
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
                success: function(rankingResponse) {
                    $.each(rankingResponse.data.overallRankings.edges, function( key, val ) {
                        var ranking = val.node;
                        var lag = "";
                        if (ranking.stage_lag > 0) {
                            lag = "+" + ranking.stage_lag + " Etappe(n)";
                        } else if (key > 0) {
                            lag = "+" + ranking.time_to_first_formatted;
                        }

                        var itemHTML = '<div class="result-item result-rank-'+(key+1)+'">'+ //don't use val.rank, as this could be a shared rank (rank 1, 1, 3)
                            '<div class="result-rank"><div>'+ranking.rank+'</div></div>'+
                            '<div class="result-name">'+
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

        return updateLeaderboard; //return the function to execute it on initial start

    }(), 1000*120); //milliseconds


    //Load stage results
    setInterval(function updateEtappen() { //reload automatically

        $('.podium').each(function(index, el) { //data-sex="F", data-sex="M", .podium-strava-segment-id (div element containing the strava segment id)

            var stravaSegmentId = $(el).closest('.podium-item').find('.podium-strava-segment-id').html(); //Webflow workaround: not possible to populate a data- attribute from a collection

            $.getJSON(
                globalAppURL+"/api/rankings?stage.segment="+stravaSegmentId+"&sex="+$(el).data('sex')+"&itemsPerPage=3",
                function(rankingResponse) {

                    $.each(rankingResponse, function( key, val ) {

                        var lbItem = $(el).find('.result-rank-'+(key+1)); //don't use val.rank, as this could be a shared rank (rank 1, 1, 3)
                        //var timeBack = (key>0 && val.ranking_time_seconds) ? "+"+new Date((val.ranking_time_seconds - rankingResponse.data[0].ranking_time_seconds) * 1000).toISOString().substr(11, 8) : '';

                        $(lbItem).find('.result-rank > div').html(val.rank);
                        $(lbItem).find('.result-time').html('<a style="font-family: monospace; text-decoration: none;" target="_blank" href="'+val.effort.effort_strava_link+'">'+val.ranking_time+'</a>');
                        $(lbItem).find('.result-name').html(val.athlete.name);

                    });
                });

        });

        return updateEtappen; //return the function to execute it on initial start

    }(), 1000*130); //milliseconds

    //Load list of supporter
    setInterval(function updateSupporter() { //reload automatically

        $.ajax({
            url: globalAppURL+"/api/athletes.json?tour.slug="+globalTourSlug+"&paid=true&pagination=false",
            type: 'GET',
            dataType: 'json',
            success: function(supporterResponse) {

                console.log(supporterResponse);
                console.log("getSupporter: get athletes.json success");

                $('#supporterList').html("");

                $.each(supporterResponse, function( key, val ) {

                    $('#supporterList').append("<a href='https://www.strava.com/athletes/"+val.strava_id+"' class='link-inline' target='_blank'>"+val.firstname+" "+val.lastname+"</a> ");

                });

            },
            error: function(data) {
                console.log(data);
            }
        });

        return updateSupporter; //return the function to execute it on initial start

    }(), 1000*130); //milliseconds


    //jump to newsticker after pagination click (instead of top)
    $('#newsticker .w-pagination-wrapper a').each(function() {
        $(this).attr('href',	$(this).attr('href')+'#newsticker');
    });

});