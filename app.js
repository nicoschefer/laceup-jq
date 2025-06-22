/* global jQuery, URLSearchParams, moment, $, gtag, ga */
(function ($) {
    'use strict';

    /* ---------------------------------------------------------------------
     *  Shared constants & helpers
     * ------------------------------------------------------------------- */

    const ITEMS_PER_PAGE        = 50;
    const BLOCKED_SUPPORTER_IDS = [3129449, 9959175, 16814702]; // Nico, Sebastian, Tobias
    const CFG          = {
        paidBadgeURL  : 'https://nicoschefer.github.io/laceup-jq/img/paid-badge.svg'
    };

    /* --- Translations -------------------------------------------------- */
    const TRANSLATIONS = {
        'number_of_stages': { de: 'Etappen', en: 'Stages' },
        'n_stages'        : { de: 'Etappe(n)', en: 'Stage(s)' },
        'athlete.name'    : { de: 'Name', en: 'Name' },
        'badges'          : { de: 'Badges', en: 'Badges' },
        'no_results'      : { de: 'Noch keine Resultate', en: 'No results yet' },
        'show_all_results': { de: 'Alle anzeigen', en: 'Show all' },
        'ranking_time'    : { de: 'Zeit', en: 'Time' },
        'time_back'       : { de: 'Rückstand', en: 'Back' },
        'supporter'       : { de: 'Unterstützer', en: 'Supporter' },
        'sex'             : { de: 'Geschlecht', en: 'Gender' }
    };
    let currentLang = 'de';

    const translate = key =>
        (TRANSLATIONS[key] && TRANSLATIONS[key][currentLang]) || `!${key}!`;

    const extractBadges = badges =>
        Array.isArray(badges) ? badges.map(b => b.type).filter(Boolean) : [];

    /* --- Bearer-token header injection --------------------------------- */
    (function setBearerToken() {
        const urlToken = new URLSearchParams(window.location.search).get('token');
        if (urlToken) localStorage.setItem('token', urlToken);

        const token = localStorage.getItem('token');
        if (token) {
            $.ajaxSetup({
                beforeSend: xhr => xhr.setRequestHeader('Authorization', `Bearer ${token}`)
            });
        }
    })();

    /* --- Generic pagination fetcher ------------------------------------ */
    function fetchAllPages(baseUrl, itemsPerPage = ITEMS_PER_PAGE, page = 1, acc = []) {
        return $.getJSON(`${baseUrl}&page=${page}`)
            .then(res => {
                if (Array.isArray(res) && res.length) {
                    acc.push(...res);
                    return res.length === itemsPerPage
                        ? fetchAllPages(baseUrl, itemsPerPage, page + 1, acc)
                        : acc;
                }
                return acc;
            });
    }

    /* --- Auto-refresh helper ------------------------------------------- */
    function startAutoRefresh(seconds, fn, ctx) {
        if (seconds > 0) setInterval(() => fn.call(ctx), seconds * 1_000);
    }

    /* --- DataTables convenience wrapper -------------------------------- */
    function buildDataTable($el, data, extra = {}) {
        return $el.DataTable({
            retrieve : true,
            data,
            processing: true,
            searching : false,
            info      : false,
            ...extra
        });
    }

    /* ---------------------------------------------------------------------
     *  $.fn plugins
     * ------------------------------------------------------------------- */

    /* 1) Basic init – sets URLs & language ------------------------------ */
    $.fn.laceUpInit = function (opt = {}) {
        const cfg = { ...CFG, ...this.data(), ...opt };
        if (cfg.language) currentLang = cfg.language;

        $('a.laceup-connect-link')
            .attr('href', `${cfg.appUrl}/tour/${cfg.slug}/connect`);
        $('a.laceup-profile-link')
            .attr('href', `${cfg.appUrl}/tour/${cfg.slug}/profile`);
        $('a.laceup-donate-link')
            .attr('href', `${cfg.appUrl}/tour/${cfg.slug}/donate`);
        $('a.laceup-stravaclub-link')
            .attr('href', cfg.stravaclubLink);

        return this;
    };

    /* 2) User status banner -------------------------------------------- */
    $.fn.laceUpUserStatus = function (opt = {}) {
        const cfg = {
            ...CFG,
            refreshSeconds   : 240,
            signupBtnSelector: '.signupbutton',
            ...this.data(),
            ...opt
        };

        const $root = this;

        function updateUI(data = {}) {
            const isTourUser = data.tour?.slug === cfg.slug;
            const isPaid     = isTourUser && data.paid;
            const isKnown    = isTourUser && !!data.id;

            $('.laceup-show-if-paid-user').toggle(isPaid);
            $('.laceup-show-if-free-user').toggle(isKnown && !isPaid);
            $('.laceup-show-if-known-user').toggle(isKnown);
            $('.laceup-show-if-unknown-user').toggle(!isKnown);

            if (isKnown && data.firstname) {
                $('.laceup-profile-placeholder').each(function () {
                    $(this).text(
                        $(this).text()
                            .replace('$$firstname$$', data.firstname)
                            .replace('$$lastname$$',  data.lastname)
                    );
                });
            }

            // personalised CTA button
            $(cfg.signupBtnSelector).each(function () {
                const $btn = $(this);
                const text = isPaid ? $btn.data('text-profile')
                    : $btn.data('text-support');
                const url  = isPaid
                    ? `${cfg.appUrl}/tour/${cfg.slug}/profile`
                    : `${cfg.appUrl}/tour/${cfg.slug}/donate`;
                $btn.text(text).attr('href', url);
            });

            // join/support banners
            if (isKnown) $('div.join').hide();
            if (isKnown && !isPaid) $('div.support').show();

            // analytics ID
            if (typeof gtag === 'function') gtag('set', { user_id: data.id });
            if (typeof ga   === 'function') ga('set',  'userId', data.id);
        }

        function loadStatus() {
            $.ajax({
                url       : `${cfg.appUrl}/api/me.json`,
                dataType  : 'json',
                headers   : { 'X-Requested-With': 'XMLHttpRequest' },
                xhrFields : { withCredentials: true },
                statusCode: {
                    200: updateUI,
                    401: () => updateUI(),
                    403: () => updateUI(),
                    500: () => updateUI()
                }
            });
        }

        startAutoRefresh(cfg.refreshSeconds, loadStatus, $root);
        loadStatus();
        return this;
    };

    /* 3) Recent activities (GraphQL) ----------------------------------- */
    $.fn.laceUpRecentActivities = function (opt = {}) {
        const cfgBase = {
            mainSelector  : '#laceup-recentactivities',
            refreshSeconds: 120,
            lastActivities: 20,
            ...this.data(),
            ...opt
        };
        // Merge any data attributes from the target element (if it exists)
        const cfg   = {
            ...CFG,
            ...cfgBase,
            ...($(cfgBase.mainSelector).data() || {})
        };
        const $root = this;

        function loadActivities() {
            const query = `{
                efforts(last: ${cfg.lastActivities},
                        order: {start_date: "asc"},
                        stage_tour_slug: "${cfg.slug}") {
                    edges {
                        node {
                            start_date ranking_time effort_strava_link elapsed_time
                            stage   { name }
                            ranking { rank }
                            athlete { name profile paid }
                        }
                    }
                }
            }`;

            $.post({
                url        : `${cfg.appUrl}/api/graphql?recent-activities`,
                contentType: 'application/json',
                data       : JSON.stringify({ query })
            }).done(res => {
                const $tpl = $(`${cfg.mainSelector} .recent-item`).first().clone();
                $(`${cfg.mainSelector} .recent-item`).remove(); // clear list

                res.data.efforts.edges.forEach(({ node }) => {
                    const ago     = moment(node.start_date).fromNow();
                    const rank    = node.ranking?.rank;
                    const rankCls = rank && rank <= 3 ? `recent-ranking-${rank}` : '';

                    const $item = $tpl.clone()
                        .toggleClass('recent-item-paid', !!node.athlete.paid);

                    const encodedProfileUrl = encodeURI(node.athlete.profile); // Ensure URL is properly encoded if gravatar contains ? character

                    $item.find('.recent-profile').html(
                        `<div class="profile-img" style="background-image:url('${encodedProfileUrl}');">
                            ${node.athlete.paid
                            ? `<a title="${translate('supporter')}" href="${cfg.appUrl}/tour/${cfg.slug}/donate">
                                    <img class="paid-badge" alt="Supporter" src="${cfg.paidBadgeURL}">
                                </a>`
                            : ''}
                        </div>`
                    );
                    $item.find('.recent-date').text(ago);
                    $item.find('.recent-name').text(node.athlete.name);
                    $item.find('.recent-stage').text(node.stage.name);
                    $item.find('.recent-time').html(
                        `<a target="_blank" href="${node.effort_strava_link}"
                            title="Rang ${rank ?? '-'}">
                            <span class="recent-ranking ${rankCls}">
                                ${node.ranking_time}
                            </span>
                         </a>`
                    );
                    $(`${cfg.mainSelector} .recent-wrapper`).prepend($item);
                });
            });
        }

        if ($(cfg.mainSelector).length) {
            startAutoRefresh(cfg.refreshSeconds, loadActivities, $root);
            loadActivities();
        }
        return this;
    };

    /* 4) Generic leaderboard / podium helpers -------------------------- */
    function renderLeaderboardItem(r, paidCls = 'result-rank-paid') {
        const lag = r.stage_lag > 0
            ? `+${r.stage_lag} Etappe(n)`
            : r.time_to_first > 0
                ? `+${r.time_to_first_formatted}`
                : '&nbsp;';

        return `<div class="result-item result-rank-${r.rank}">
                    <div class="result-rank ${r.athlete.paid ? paidCls : ''}">
                        <div>${r.rank}</div>
                    </div>
                    <div class="result-name truncate">
                        ${r.athlete.name}<br>
                        <small class="paragraph-light paragraph-small">
                            ${r.number_of_stages} Etappe(n)
                        </small>
                    </div>
                    <div class="result-time">
                        ${r.ranking_time}<br>
                        <small class="paragraph-light paragraph-small" style="float:right;">
                            ${lag}
                        </small>
                    </div>
                </div>`;
    }

    /* 4a) Leaderboard --------------------------------------------------- */
    $.fn.laceUpLeaderboard = function (opt = {}) {
        const cfg = {
            ...CFG,
            mainSelector  : '.laceup-leaderboard',
            refreshSeconds: 240,
            limit         : 10,
            ...this.data(),
            ...opt
        };
        const $root = this;

        function loadLeaderboard() {
            $(cfg.mainSelector).each((_, el) => {
                const eCfg = { ...cfg, ...$(el).data() };
                const query = `{
                    overallRankings(tour_slug: "${eCfg.slug}",
                                    sex: "${$(el).data('sex')}",
                                    first: ${eCfg.limit}) {
                        edges {
                            node {
                                stage_lag time_to_first_formatted time_to_first
                                rank number_of_stages ranking_time
                                athlete { name paid }
                            }
                        }
                    }
                }`;

                $.post({
                    url        : `${eCfg.appUrl}/api/graphql?leaderboard`,
                    contentType: 'application/json',
                    data       : JSON.stringify({ query })
                }).done(resp => {
                    $(el).empty();
                    resp.data.overallRankings.edges
                        .map(e => renderLeaderboardItem(e.node))
                        .forEach(html => $(el).append(html));
                });
            });
        }

        if ($(cfg.mainSelector).length) {
            startAutoRefresh(cfg.refreshSeconds, loadLeaderboard, $root);
            loadLeaderboard();
        }
        return this;
    };

    /* 4b) Stage podium (TOP 3) ----------------------------------------- */
    $.fn.laceUpStagePodium = function (opt = {}) {
        const cfg = {
            ...CFG,
            mainSelector  : '.laceup-podium',
            refreshSeconds: 240,
            limit         : 3,
            ...this.data(),
            ...opt
        };
        const $root = this;

        function loadPodium() {
            $(cfg.mainSelector).each((_, el) => {
                const eCfg   = { ...cfg, ...$(el).data() };
                const stageId = $(el).closest('.podium-item')
                    .find('.podium-laceup-stage-id')
                    .text();

                $.getJSON(`${eCfg.appUrl}/api/rankings?stage.id=${stageId}` +
                    `&sex=${$(el).data('sex')}&itemsPerPage=${eCfg.limit}`)
                    .done(rows => rows.forEach((row, idx) => {
                        const $item = $(el).find(`.result-rank-${idx + 1}`);
                        $item.find('.result-rank > div').text(row.rank);
                        $item.find('.result-name').text(row.athlete.name);
                        $item.find('.result-time').html(
                            `<a target="_blank"
                                style="font-family:monospace;text-decoration:none;"
                                href="${row.effort.effort_strava_link}">
                                ${row.ranking_time}
                             </a>`
                        );
                        $item.removeClass(`result-rank-${idx + 1}`)
                            .addClass(`result-rank-${row.rank}`);
                    }));
            });
        }

        startAutoRefresh(cfg.refreshSeconds, loadPodium, $root);
        loadPodium();
        return this;
    };

    /* 5) Stage ranking (DataTable) ------------------------------------- */
    $.fn.laceUpStageRanking = function (opt = {}) {
        const cfg = { ...CFG, mainSelector: '.laceup-stageranking', ...this.data(), ...opt };

        function loadTable() {
            $(`${cfg.mainSelector}:not([data-stageid=""])`).each((_, el) => {
                const eCfg = { ...cfg, ...$(el).data() };
                const base = `${eCfg.appUrl}/api/rankings?stage.id=${$(el).data('stageid')}` +
                    `&sex=${$(el).data('sex')}&itemsPerPage=${ITEMS_PER_PAGE}`;

                fetchAllPages(base).then(rows => {
                    buildDataTable($(el), rows, {
                        conditionalPaging: true,
                        lengthMenu       : [[100, -1], [100, translate('show_all_results')]],
                        columns: [
                            { title: 'Rang', data: 'rank' },
                            {
                                title: '',
                                data : 'athlete.profile',
                                render(data, _, row) {
                                    return `<div class="ranking-profile ${row.athlete.paid ? 'ranking-profile-paid' : ''}">
                                                <div class="profile-img" style="background-image:url(${data});">
                                                    ${row.athlete.paid
                                        ? `<a class="ranking-paid-badge"
                                                             title="${translate('supporter')}"
                                                             href="${eCfg.appUrl}/tour/${eCfg.slug}/donate">
                                                                <img class="paid-badge"
                                                                     alt="Supporter badge"
                                                                     src="${eCfg.paidBadgeURL}">
                                                           </a>`
                                        : ''}
                                                </div>
                                            </div>`;
                                }
                            },
                            {
                                title: 'Name',
                                data : 'athlete.name',
                                render: (n, _, row) => `<a style="text-decoration:none;"
                                                           href="${row.athlete.oauth_link}"
                                                           target="_blank">${n}</a>`
                            },
                            {
                                title: 'Zeit',
                                data : 'ranking_time',
                                render: (d, _, row) => `<a style="font-family:monospace;text-decoration:none;"
                                                           target="_blank"
                                                           href="${row.effort.effort_strava_link}">${d}</a>`
                            }
                        ],
                        columnDefs: [
                            { targets: 0, width: '5%' },
                            { targets: 1, width: '10%' },
                            { targets: 2, width: '50%' },
                            { targets: -1, className: 'dt-body-right', width: '35%' }
                        ]
                    }).on('page.dt', () =>
                        $('html, body').animate({ scrollTop: $(el).offset().top }, 200)
                    );
                });
            });
        }

        loadTable();
        return this;
    };

    /* 6) Overall rankings (plain & with badges) ------------------------- */
    function buildOverallTable($el, rows, cfg, withBadges = false) {
        const availableBadges = withBadges
            ? (cfg.badges?.split(',').filter(Boolean) || ['hare', 'bat', 'bee'])
            : null;

        buildDataTable($el, rows, {
            responsive: true,
            paging    : false,
            columns: [
                { title: '', data: 'rank' },
                {
                    title: '',
                    data : 'athlete.profile',
                    render(data, _, row) {
                        return `<div class="ranking-profile ${row.athlete.paid ? 'ranking-profile-paid' : ''}">
                                    <div class="profile-img" style="background-image:url(${data});">
                                        ${row.athlete.paid
                            ? `<a title="${translate('supporter')}"
                                                  href="${cfg.appUrl}/tour/${cfg.slug}/donate">
                                                    <img class="paid-badge"
                                                         alt="Supporter badge"
                                                         src="${cfg.paidBadgeURL}">
                                               </a>`
                            : ''}
                                    </div>
                                </div>`;
                    }
                },
                {
                    title : translate('athlete.name'),
                    data  : 'athlete.name',
                    render: (name, _, row) => `<a style="text-decoration:none;"
                                                  href="${row.athlete.oauth_link}"
                                                  target="_blank">${name}</a>`
                },
                { title: translate('number_of_stages'), data: 'number_of_stages' },
                withBadges
                    ? {
                        title : translate('badges'),
                        render(_, __, row) {
                            const have = extractBadges(row.athlete.badges || []);
                            return `<div class="badge-container">${
                                availableBadges.map(b =>
                                    `<div class="achieved-badge ${have.includes(b) ? '' : 'achieved-badge-passive'} ${b}"></div>`
                                ).join('')
                            }</div>`;
                        }
                    }
                    : { title: translate('ranking_time'), data: 'ranking_time', render: d => `<span class="ranking-time">${d}</span>` },
                withBadges
                    ? { title: translate('ranking_time'), data: 'ranking_time', render: d => `<span class="ranking-time">${d}</span>` }
                    : null,
                {
                    title : translate('time_back'),
                    render(_, __, row) {
                        const lag = row.rank > 1 && row.stage_lag === 0 ? row.time_to_first_formatted : '';
                        return `<span class="ranking-time ranking-time-back">${lag}</span>`;
                    }
                }
            ].filter(Boolean),
            columnDefs: [
                { responsivePriority: 1, targets: 0, width: '5%' },
                { responsivePriority: 4, targets: 1, width: '10%' },
                { responsivePriority: 2, targets: 2, width: '70%' }
            ],
            drawCallback() {
                const api  = this.api();
                const rows = api.rows({ page: 'current' }).nodes();
                let last   = null;
                api.column(3, { page: 'current' }).data().each(function (grp, i) {
                    if (last !== grp) {
                        $(rows).eq(i).before(
                            `<tr style="text-align:center;">
                                <td colspan="7"><small>${grp} ${translate('n_stages')}</small></td>
                             </tr>`
                        );
                        last = grp;
                    }
                });
            }
        });
    }

    $.fn.laceUpOverallRanking = function (opt = {}) {
        const cfg = { ...CFG, mainSelector: '.laceup-ranking', ...this.data(), ...opt };

        $(cfg.mainSelector).each((_, el) => {
            const eCfg = { ...cfg, ...$(el).data() };
            const base = `${eCfg.appUrl}/api/overall_rankings?tour.slug=${eCfg.slug}` +
                `&sex=${$(el).data('sex')}&itemsPerPage=${ITEMS_PER_PAGE}`;
            fetchAllPages(base).then(rows => buildOverallTable($(el), rows, eCfg, false));
        });

        return this;
    };

    $.fn.laceUpOverallRankingWithBadges = function (opt = {}) {
        const cfg = { ...CFG, mainSelector: '.laceup-ranking', ...this.data(), ...opt };

        $(cfg.mainSelector).each((_, el) => {
            const eCfg = { ...cfg, ...$(el).data() };
            const base = `${eCfg.appUrl}/api/overall_rankings?tour.slug=${eCfg.slug}` +
                `&sex=${$(el).data('sex')}&itemsPerPage=${ITEMS_PER_PAGE}`;
            fetchAllPages(base).then(rows => buildOverallTable($(el), rows, eCfg, true));
        });

        return this;
    };

    /* 7) Supporter ticker ---------------------------------------------- */
    $.fn.laceUpSupporter = function (opt = {}) {
        const cfgBase = {
            mainSelector  : '#laceup-supporter',
            refreshSeconds: 480,
            limit         : 1000,
            ...this.data(),
            ...opt
        };
        const cfg = { ...CFG,...cfgBase, ...($(cfgBase.mainSelector).data() || {}) };
        const $root = this;

        function loadSupporters() {
            const base = `${cfg.appUrl}/api/athletes.json?tour.slug=${cfg.slug}` +
                `&paid=true&itemsPerPage=${ITEMS_PER_PAGE}`;
            fetchAllPages(base).then(all => {
                const list = all
                    .filter(a => !BLOCKED_SUPPORTER_IDS.includes(a.oauth_id))
                    .sort(() => Math.random() - 0.5)
                    .slice(0, cfg.limit);

                $(cfg.mainSelector).html(
                    list.map(a => `<a href="${a.oauth_link}" class="link-inline" target="_blank">${a.name}</a>`)
                        .join(' ')
                );
            });
        }

        if ($(cfg.mainSelector).length) {
            startAutoRefresh(cfg.refreshSeconds, loadSupporters, $root);
            loadSupporters();
        }
        return this;
    };

    /* 8) Starter list (DataTable) -------------------------------------- */
    $.fn.laceUpStarter = function (opt = {}) {
        const cfg = { ...CFG, mainSelector: '.laceup-starter', sex: '', ...this.data(), ...opt };

        const base = `${cfg.appUrl}/api/athletes.json?tour.slug=${cfg.slug}&itemsPerPage=${ITEMS_PER_PAGE}` +
            (cfg.sex ? `&sex=${cfg.sex}` : '');

        fetchAllPages(base).then(rows => {
            buildDataTable($(cfg.mainSelector), rows, {
                conditionalPaging: true,
                lengthMenu       : [[100, -1], [100, translate('show_all_results')]],
                ordering         : true,
                order            : [[1, 'asc']],
                columns: [
                    {
                        title: '',
                        data : 'profile',
                        render(data, _, row) {
                            return `<div class="ranking-profile ${row.paid ? 'ranking-profile-paid' : ''}">
                                        <div class="profile-img" style="background-image:url(${data});">
                                            ${row.paid
                                ? `<a class="ranking-paid-badge"
                                                      title="${translate('supporter')}"
                                                      href="${cfg.appUrl}/tour/${cfg.slug}/donate">
                                                        <img class="paid-badge"
                                                             alt="Supporter badge"
                                                             src="${cfg.paidBadgeURL}">
                                                   </a>`
                                : ''}
                                        </div>
                                    </div>`;
                        }
                    },
                    {
                        title : 'Name',
                        data  : 'name',
                        render: (n, _, row) => `<a style="text-decoration:none;"
                                                   href="${row.oauth_link}"
                                                   target="_blank">${n}</a>`
                    }
                ],
                columnDefs: [
                    { targets: 0, width: '20%' },
                    { targets: 1, width: '80%' }
                ]
            });
        });

        return this;
    };

})(jQuery);