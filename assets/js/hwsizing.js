var options = {};
var platform = _.uniq(_.map(sizingData, 'Platform'));
var x_physical = false;
var x_virtual = false;
var x_aws = false;
var x_qlikview = false;
var x_sense = false;
var x_qap = false;
var x_product = "";

// fix QAP stuff...
sizingData.forEach(function(p) {
    if (p.Type == "QAP") {
        p.Type = p.CPU.split(':', 1)[0];
        p.CPU = p.CPU.substring(p.CPU.indexOf(":")+1).trim();
    }
});

var allMetrics = _.filter(userVolume, { 'Product': 'sense' });
for(var i = 0; i < allMetrics.length; i++) {
    var o = allMetrics[i];
    if (o.Users > 0)
        $('#users_' + o.Size).text($('#users_' + o.Size).text().replace(/(.*)\s(\d+)\s(.*)\s(\d+)(m.*)/, '$1 ' + o.Users + ' $3 ' + o.Data + '$5'));
}


$("input:radio, input:checkbox").change(function () {

    var current = this.name.replace('chk_','');
    if (platform.indexOf(current) >= 0)
        $('#table-wrapper-' + current).toggle();

    var radioCount = 0;
    $('input[type="radio"]').each(function() {
        if ($(this).is(":checked")) {
            radioCount++;
        }
    });

    var checkboxCount = 0;
    $('input[type="checkbox"]').each(function() {
        if ($(this).is(":checked") && this.name != 'chk_options') {
            checkboxCount++;
        }
    });

    if (current == "r_product")
    {
        // if QAP is selected/deselected
        switch (currentProduct()) {
            case "qap":
                $('#optionalXSmall').show();
                break;
            default:
                if (currentUsers("xsmall"))
                {
                    $('input[name=r_users]').attr('checked', false);
                    $('input[name=r_users]').prop('checked', false);
                    $('#optionalXSmall').removeClass('active');
                    radioCount--;
                }
                $('#optionalXSmall').hide();
                break;
        }
    }

    if (current == "r_users")
    {
        $('input[name=chk_options]').attr('checked', false);
        $('input[name=chk_options]').prop('checked', false);
        $('#l_options').removeClass('active');

        switch (currentUsers()) {
/*            case "xsmall":
                $('#optionalCheckbox').hide();
                $('#optional').text('');
                break;
*/
            case "xsmall":
            case "small":
                $('#optionalCheckbox').show();
                if (currentProduct("QAP"))
                    $('#optional').text(' High availability');
                else
                    $('#optional').text(' Intraday refresh');
                break;
            case "medium":
                $('#optionalCheckbox').show();
                $('#optional').text(' High availability');
                break;
            case "large":
                $('#optionalCheckbox').show();
                if (currentProduct("QAP"))
                    $('#optional').text(' High availability');
                else
                    $('#optional').text(' High refresh rate');
                break;
                break;
        }
    }

    // show result
    if (radioCount >= 2 && checkboxCount > 0) {
        var clonedArray = JSON.parse(JSON.stringify(sizingData))

        platform.forEach(function(p) {
            renderData = clonedArray.filter(function(item) {
                if (item.Type.substring(0, 3) == "QAP" && ($('input[name=r_product]:checked').val() != "QAP")) return null;
                if (item.Type.substring(0, 3) != "QAP" && ($('input[name=r_product]:checked').val() == "QAP")) return null;
                if (item.Type == "Central" && ($('input[name=r_product]:checked').val() != "Sense")) return null;
                if (item.Optional == "yes" && !$('input[name=chk_options]:checked').val()) return null;
                if (item.Platform != p || !$('input[name=chk_' + p + ']:checked').val()) return null;
                return item.Sizing == $('input[name=r_users]:checked').val();
            });

            var x = uniq(renderData);

            $('#table-wrapper-' + p).renderTable({
                    template: rowTemplate,
                    data: x,
                    defaultSortField: 'Type',
                    defaultSortOrder: 1
            });
        });

        // update variables
        _.find(languageData, { 'Tags': "x_users" }).Text=currentUsers();

        var currentMetrics = _.filter(userVolume, { 'Product': currentProduct(), 'Size': currentUsers() });
        if(typeof $('input[name=chk_options]:checked').val() !== "undefined")
            var multi = currentMetrics[0].Multiplier;
        else
            var multi = 1;

        _.find(languageData, { 'Tags': "x_users_no" }).Text= btoa(currentMetrics[0].Users * multi);
        _.find(languageData, { 'Tags': "x_data_vol" }).Text= btoa(currentMetrics[0].Data * multi);

        if (current == "options")
        {
            var allMetrics = _.filter(userVolume, { 'Product': currentProduct() });
            for(var i = 0; i < allMetrics.length; i++) {
                var o = allMetrics[i];
                if(typeof $('input[name=chk_options]:checked').val() !== "undefined")
                    var multi = o.Multiplier;
                else
                    var multi = 1;

                if (o.Users > 0)
                    $('#users_' + o.Size).text($('#users_' + o.Size).text().replace(/(.*)\s(\d+)\s(.*)\s(\d+)(m.*)/, '$1 ' + o.Users * multi + ' $3 ' + o.Data * multi + '$5'));
          }
        }

        switch (currentProduct())
        {
            case "sense":
                _.find(languageData, { 'Tags': "x_product" }).Text = btoa("Qlik Sense®");
                break;
            case "qlikview":
                _.find(languageData, { 'Tags': "x_product" }).Text = btoa("QlikView®");
                break;
            case "qap":
                _.find(languageData, { 'Tags': "x_product" }).Text = btoa("Qlik® Analytics Platform");
                break;
        }

        $("#container-data").html(function() {
            return getText("masterpage");
        });

        $('#container-welcome').hide();
        $('#container-recommendation').show();
    } else {
        $('#container-recommendation').hide();
        $('#container-welcome').show();
    }

})

function compareArrays(str, arr) {
//    arr = arr.replace(new RegExp(" ","g"),"|"); 
//    var re = new RegExp(arr,"g");
//    var count = (str.match(re) || []).length;
//    var res = str.match(new RegExp(arr,"g"));
    if (str.indexOf("platform") > -1)
    {
        // do nothing for now
    }
    else if ((str.match(/ /g) || []).length == 1)
    {
        if($('input[name=r_product]:checked').val() != undefined)
            arr = arr + " " + $('input[name=r_product]:checked').val().toLowerCase();
    }
    else if ((str.match(/ /g) || []).length == 2)
    {
        if($('input[name=r_product]:checked').val() != undefined)
            arr = arr + " " + $('input[name=r_product]:checked').val().toLowerCase();
        if($('input[name=r_users]:checked').val().toLowerCase() != undefined)
            arr = arr + " " + $('input[name=r_users]:checked').val().toLowerCase();
    }
    return _.isEqual(str.split(" ").sort(), arr.split(" ").sort())
}

function getText(tags) {
    // selected options to variables   
    x_optional = $('input[name="chk_options"]').is(':checked');
    x_physical = $('input[name="chk_Physical"]').is(':checked');
    x_virtual = $('input[name="chk_Virtual"]').is(':checked');
    x_aws = $('input[name="chk_AWS"]').is(':checked');
    x_azure = $('input[name="chk_Azure"]').is(':checked');
    x_sense = $('input[name=r_product]:checked').val() == "Sense";
    x_qlikview = $('input[name=r_product]:checked').val() == "QlikView";
    x_qap = $('input[name=r_product]:checked').val() == "QAP";

    // sort by most tags (?????)
    var z = _.sortBy(languageData, function(n) {
      return n.Tags.split(" ").length;
    }).reverse();

    // get text for language
    var x = _.find(languageData, function(item) {
        //console.log(navigator.language.toLowerCase());
        // navigator.language.toLowerCase()
        //var y = item.Language == 'en-us' && compareArrays(item.Tags, tags);
        //if (y !== undefined)
        //    return y;
        return item.Language == 'en-us' && compareArrays(item.Tags, tags);
    });

    // no match
    if(x == undefined)
    {
        //console.log(tags);
        return "[NOT IMPLEMENTED YET]";
    }

    // convert from base64
    if (_.result(x, 'Text') != undefined)
        var t = atob(_.result(x, 'Text'))

    // replace if-else tags with content
    var regex = /\$\((.*?),(.*?),(.*?)\)/g
    while(result = regex.exec(t)) {
        var x = new RegExp(result[0].replace(/[\(\)\$]/g,"\\$&"))
        if (eval(result[1]))
            t = t.replace(x, result[2]);
        else
            t = t.replace(x, result[3]);
    }

    // ** for bold text
    var regex = /\*{2}(.*?)\*{2}/g
    while(result = regex.exec(t)) {
        t = t.replace(result[0], "<strong>" + result[1] + "</strong>");
    }

    // :: for italic text
    var regex = /\:{2}(.*?)\:{2}/g
    while(result = regex.exec(t)) {
        t = t.replace(result[0], "<em>" + result[1] + "</em>");
    }

    // ;; for smaller text
    var regex = /\;{2}(.*?)\;{2}/g
    while(result = regex.exec(t)) {
        t = t.replace(result[0], "<smaller>" + result[1] + "</smaller>");
    }

    // insert recommendation table
    t = t.replace("{{table-data}}",'<div id="container-hardware2"></div>');
    
    // replace tags with content
    regex = /{{.*?}}/g
    while(result = regex.exec(t)) {
        t = t.replace(result[0],getText(result[0].replace(/[{}]/g,'')));
    }
    return t;
}

function showResults() {
    $("#container-hardware").toggle();
    $("#container-hardware2").html(function() {
        return $("#container-hardware").html();
    });

    // empty sidebar for copy/paste into Word
    if ($("#sidebar-wrapper").html() != "")
    {
        sidebar = $("#sidebar-wrapper").html();
        $("#sidebar-wrapper").empty();
    }
    else
    {
        $("#sidebar-wrapper").html(sidebar);        
        location.reload();
    }
}

var rowTemplate = '<tr>' +
                    '<td><%this.No%> x <%this.Type.checkPlatform()%> </td>' +
                    '<td><%this.CPU%> </td>' +
                    '<td><%this.RAM%> </td>' +
                    '<td><%this.Storage%> </td>' +
                  '</tr>';

//Initialize page
$(document).ready(function(e){


    languageData.push({"Language":"en-us", "Tags":"x_platform", "Text": btoa(""), "Url": ""});
    languageData.push({"Language":"en-us", "Tags":"x_users", "Text": btoa(""), "Url": ""});
    languageData.push({"Language":"en-us", "Tags":"x_users_no", "Text": btoa(""), "Url": ""});
    languageData.push({"Language":"en-us", "Tags":"x_data_vol", "Text": btoa(""), "Url": ""});
    languageData.push({"Language":"en-us", "Tags":"x_product", "Text": btoa(""), "Url": ""});

/*    $("#container-disclaimer").html(function() {
        return getText("disclaimer");
    });

    $("#container-header").html(function() {
        return getText("header");
    });
*/
    $("#container-welcomepage").html(function() {
        return getText("welcomepage");
    });

    $("#container-hardware").html(function() {
        var platform = _.uniq(_.map(sizingData, 'Platform'));
        var t = "";
        platform.forEach(function(item) {
            t = t + '<div id="table-wrapper-' + item + '">' +
                        '<strong>' + item + ' Environment</strong>' +
                        '<table class="table table-striped">' +
                            '<thead>' +
                                '<tr>' +
                                    '<th width="30%">Type</th>' +
                                    '<th width="50%">CPU</th>' +
                                    '<th width="10%">RAM</th>' +
                                    '<th width="10%">Storage</th>' +
                                '</tr>' +
                            '</thead>' +
                            '<tbody>' +
                            '</tbody>' +
                        '</table>' +
                    '</div>';
        });
        return t;
    });

    // deselect checkbox hack...
    $('#optionalCheckbox').hide();
    var parser = new UAParser();
    var name = parser.getResult().browser.name
    if (name == "Chrome") {
        $('input[type="checkbox"]').each(function() {
            if ($(this).is(":checked") && this.name != 'chk_options') {
                //$(this).trigger("click");
                $(this).click();
                $(this).prop("checked", false);
                $(this).attr("checked", false);
            }
        });
    }
/*    $("#sidebar-platform").html(function() {
        //var platform = ['Physical', 'Virtual', 'AWS', 'Azure'];
        var platform = _.uniq(_.map(sizingData, 'Platform'));
        var t = "";
        platform.forEach(function(item) {
            t = t + '<label class="btn active">' +
                    '<input type="checkbox" name="chk_' + item + '" checked><i class="fa fa-square-o fa-2x"></i><i class="fa fa-check-square-o fa-2x"></i> <span>  ' + item + '</span>' +
                    '</label>';
        });
        return t;
    });*/

    /*$("#sidebar-platform").html("");
    var platform = _.uniq(_.map(sizingData, 'Platform'));
    platform.forEach(function(item) {
        addCheckbox(item);
    });*/
       

});
/*
function addCheckbox(name) {
   var container = $('#sidebar-platform');
   var inputs = container.find('input');
   var id = inputs.length+1;

   $('<label />', { class: 'btn active', id: 'lbl_' + name }).appendTo(container);
   $('<input />', { type: 'checkbox', name: 'chk_'+ name, checked: 'checked' }).appendTo($('#lbl_' + name));
   $('<i />', { class: 'fa fa-square-o fa-2x' }).appendTo($('#lbl_' + name));
   $('<i />', { class: 'fa fa-check-square-o fa-2x' }).appendTo($('#lbl_' + name));
   $('<span>  ' + name + '</span>').appendTo($('#lbl_' + name));
}
*/
function uniq(a) {
    _(a).forEach(function(n) {
      delete n['Optional'];
    }).value();

    var b = _.uniq(a, function(n) {
        return n.Type + n.CPU + n.RAM + n.Storage;
    });
    
    var c = _.difference(a,b);
    
    if (c.length > 0) {
        for (i = 0; i < c.length; i++) { 
            _(b).forEach(function(n) {
              if (n.Type + n.CPU + n.RAM + n.Storage == c[i].Type + c[i].CPU + c[i].RAM + c[i].Storage)
                n.No = Number(n.No) + 1;
            }).value();
        }
    }
    return b;
}

function currentProduct(p) {
    var tmp = $('input[name=r_product]:checked').val() || '';
    if (p)
        return tmp.toLowerCase() == p.toLowerCase() ? true : false;
    else
        return tmp.toLowerCase();
}

function currentUsers(p) {
    var tmp = $('input[name=r_users]:checked').val() || '';
    if (p)
        return tmp.toLowerCase() == p.toLowerCase() ? true : false;
    else
        return tmp.toLowerCase();
}

String.prototype.checkPlatform = function() {
    if ($('input[name=r_product]:checked').val() == "QlikView") {
        if (this == "PUB/Scheduler") return "QlikView Publisher";
        if (this == "QVS/Engine") return "QlikView Server";
    } else {
        if ($('input[name=r_users]:checked').val().toLowerCase() == "large") {
            if (this == "PUB/Scheduler") return "Qlik Sense Scheduler Node";
            if (this == "QVS/Engine") return "Qlik Sense Rim Node";
            if (this == "Central") return "Qlik Sense Central Node";
        } else {
            if (this == "PUB/Scheduler") return "Qlik Sense Rim Node";
            if (this == "QVS/Engine") return "Qlik Sense Central Node";
        }
    }
    return this;
};
