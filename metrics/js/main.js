//var prefix = window.location.pathname.substr( 0, window.location.pathname.toLowerCase().lastIndexOf( "/extensions" ) + 1 );

var config = {
    host: "solutions.qliktech.com",
    prefix: "/qhc/",
    port: window.location.port,
    isSecure: window.location.protocol === "https:"
};
//to avoid errors in workbench: you can remove this when you have added an app
var app;
require.config( {
    baseUrl: (config.isSecure ? "https://" : "http://" ) + config.host + (config.port ? ":" + config.port : "" ) + config.prefix + "resources"
} );

require( ["js/qlik"], function ( qlik ) {

    var control = false;
    qlik.setOnError( function ( error ) {
        $( '#popupText' ).append( error.message + "<br>" );
        if ( !control ) {
            control = true;
            $( '#popup' ).delay( 1000 ).fadeIn( 1000 ).delay( 11000 ).fadeOut( 1000 );
        }
    } );
    $("#tgl").click(function(e) {
        e.preventDefault();
        $("#wrapper").toggleClass("toggled");
        qlik.resize();
    });
    $( "#closePopup" ).click( function () {
        $( '#popup' ).hide();
    } );
    if ( $( 'ul#qbmlist li' ).length === 0 ) {
        $( '#qbmlist' ).append( "<li><a>No bookmarks available</a></li>" );
    }
    $( "body" ).css( "overflow: hidden;" );
    function AppUi ( app ) {
        var me = this;
        this.app = app;
        app.global.isPersonalMode( function ( reply ) {
            me.isPersonalMode = reply.qReturn;
        } );
        app.getAppLayout( function ( layout ) {
            //$( "#title" ).html( layout.qTitle );
            //$( "#title" ).attr( "title", "Last reload:" + layout.qLastReloadTime.replace( /T/, ' ' ).replace( /Z/, ' ' ) );

        } );
        app.getList( 'SelectionObject', function ( reply ) {
            $( "[data-qcmd='back']" ).parent().toggleClass( 'disabled', reply.qSelectionObject.qBackCount < 1 );
            $( "[data-qcmd='forward']" ).parent().toggleClass( 'disabled', reply.qSelectionObject.qForwardCount < 1 );
        } );
        app.getList( "BookmarkList", function ( reply ) {
            var str = "";
            reply.qBookmarkList.qItems.forEach( function ( value ) {
                if ( value.qData.title ) {
                    str += '<li><a data-id="' + value.qInfo.qId + '">' + value.qData.title + '</a></li>';
                }
            } );
            str += '<li><a data-cmd="create">Create</a></li>';
            $( '#qbmlist' ).html( str ).find( 'a' ).on( 'click', function () {
                var id = $( this ).data( 'id' );
                if ( id ) {
                    app.bookmark.apply( id );
                } else {
                    var cmd = $( this ).data( 'cmd' );
                    if ( cmd === "create" ) {
                        $( '#createBmModal' ).modal();
                    }
                }
            } );
        } );
        $( "[data-qcmd]" ).on( 'click', function () {
            var $element = $( this );
            switch ( $element.data( 'qcmd' ) ) {
                //app level commands
                case 'clearAll':
                    app.clearAll();
                    break;
                case 'back':
                    app.back();
                    break;
                case 'forward':
                    app.forward();
                    break;
                case 'lockAll':
                    app.lockAll();
                    break;
                case 'unlockAll':
                    app.unlockAll();
                    break;
                case 'createBm':
                    var title = $( "#bmtitle" ).val(), desc = $( "#bmdesc" ).val();
                    app.bookmark.create( title, desc );
                    $( '#createBmModal' ).modal( 'hide' );
                    break;
            }
        } );
    }

    //callbacks -- inserted here --
    //open apps -- inserted here --
    //var app = qlik.openApp('QAHCMash.qvf', config);
    //var app = qlik.openApp('750bd453-3b7b-4998-83a6-6fcd62ae7469', config);
    var app = qlik.openApp('1f4602ea-b27a-4c19-8ca4-55ba72af6269', config);


    //get objects -- first App Group --
    app.getObject('QV01','GP');
    app.getObject('QV02','QPMcGd');
    app.getObject('QV03','WJDuEUN');
    app.getObject('QV04','adLJJZ');
    app.getObject('QV05','gzndjJ');
    app.getObject('QV06','rmkVxY');
    //get objects -- second App Group --
    app.getObject('QV07','WQSQDht');
    app.getObject('QV08','mnLjuZ');
    app.getObject('QV09','pvZnLy');
    app.getObject('QV10','zRewPuE');
    app.getObject('QV11','WgKAWTD');
    app.getObject('QV12','gcQsN');
    //get objects -- third App Group --
    app.getObject('QV13','ebQQUM');
    app.getObject('QV14','dWncjb');
    app.getObject('QV15','DWLmzq');
    app.getObject('QV16','fEjCNP');
    app.getObject('QV17','bbrGAj');
    app.getObject('QV18','KcSpY');
    //get objects -- fourth App Group --
    app.getObject('QV19','jPjfhvQ');
    app.getObject('QV20','cVZjh');
    app.getObject('QV21','gNHdZC');
    app.getObject('QV22','ymKjUAT');
    app.getObject('QV23','sjCJZ');
    app.getObject('QV24','kfFmjj');
    //get objects -- Result Summary --
    app.getObject('QV25','cmjSX');    //CPU
    app.getObject('QV25L','sKAXd');     //LABEL CPU
    //app.getObject('QV26','dEzmpv');     //RAM
    app.getObject('QV26','JTcFtAu');    //RAM
    app.getObject('QV26L','BukGLg');    //LABEL RAM
    app.getObject('QV27','esyVYv');     //APPS
    app.getObject('QV27L','dLHYmBe');   //LABEL APPS
    app.getObject('QV28','zVwJm');      //DATA
    app.getObject('QV28L','ePtTq');     //LABEL DATA
    app.getObject('QV29','PyZgFwN');    //USERS
    app.getObject('QV29L','mCkwv');     //LABEL USERS
    //get objects -- Filters --
    app.getObject('QV30','jJXpJR');//PROCESSOR NAME
    app.getObject('QV31','hehKnb');//PROCESSOR CORE
    app.getObject('QV32','aHjRfhK');//TURBO + PRODUCT
    //get objects -- Feedback settings --
    //app.getObject('QV33','yZVpJB');
    //get objects -- Engine # --
    app.getObject('QV34','PPqMjk');
    app.getObject('QV34L','Rtvse').then(function(){
        setTimeout(function(){qlik.resize()},5000);
    })
    
    app.getObject('QV40','fgHXtj');
    app.getObject('QV41','mwJwVeP');
    app.getObject('QV42','JYHsSm');
    app.getObject('QV43','cfmQer');

    app.getObject('QV50','ANJjP');

    app.getObject('QV51','UxBwyX');    // Product

    //create cubes and lists -- inserted here --
    if ( app ) {
        new AppUi( app );
    }

} );
