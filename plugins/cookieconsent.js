function enableGoogleAnalytics(){
    if($('#laceup-meta').data('ga-code')){

        console.log('enableGoogleAnalytics()');
        ga("create", $('#laceup-meta').data('ga-code'), "auto");
        ga("send", "pageview");

    }
}
if($('#laceup-meta').data('ga-optin')){ //ask for opt-in

    window.cookieconsent.initialise({
        "palette": {
            "popup": {
                "background": "#edeff5",
                "text": "#838391"
            },
            "button": {
                "background": "#207DDE"
            }
        },
        "showLink": false,
        "position": "bottom-right",
        "type": "opt-out",
        "content": {
            "message": "Diese Website benutzt Cookies. Wenn du die Website weiter nutzt, gehen wir von deinem Einverständnis aus.",
            "allow": "Okay!",
            "deny": "Ablehnen",
            "link": "Cookie Einstellungen"
        },
        revokable:false,
        onInitialise: function (status) {

            if(this.hasConsented()){
                enableGoogleAnalytics();
            }

        },
        onStatusChange: function(status) {

            if(this.hasConsented()){
                enableGoogleAnalytics();
            }

        }
    });

}
else{
    enableGoogleAnalytics();
}