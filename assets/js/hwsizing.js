var options = {};
var platform = ['Physical', 'Virtual', 'AWS'];
var x_physical = false;
var x_virtual = false;
var x_aws = false;
var x_qlikview = false;
var x_sense = false;
var x_product = "";

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

    if (current == "r_users")
    {
        $('input[name=chk_options]').attr('checked', false);
        $('input[name=chk_options]').prop('checked', false);
        $('#l_options').removeClass('active');

        switch ($('input[name=r_users]:checked').val().toLowerCase()) {
            case "small":
                $('#optionalCheckbox').show();
                $('#optional').text(' Intraday refresh');
                break;
            case "medium":
                $('#optionalCheckbox').show();
                $('#optional').text(' High availability');
                break;
            case "large":
                $('#optionalCheckbox').hide();
                break;
        }
    }

    // show result
    if (radioCount >= 2 && checkboxCount > 0) {
        var clonedArray = JSON.parse(JSON.stringify(sizingData))

/*        $('input[type="checkbox"]').each(function() {
            if ($(this).is(":checked") && this.name != 'chk_options') {
                var p = this.name.replace("chk_", "");
                renderData = clonedArray.filter(function(item) {
                    if (item.Type == "Central" && ($('input[name=r_product]:checked').val() == "QlikView")) return null;
                    if (item.Optional == "yes" && !$('input[name=chk_options]:checked').val()) return null;
                    if (item.Platform != p) return null;
                console.log(item.Platform + ":" + p);
                    if (item.Sizing == $('input[name=r_users]:checked').val() && item.Platform == p)
                        return true;
                    else
                        return false;
                });

            }
*/

        platform.forEach(function(p) {
            renderData = clonedArray.filter(function(item) {
                if (item.Type == "Central" && ($('input[name=r_product]:checked').val() == "QlikView")) return null;
                if (item.Optional == "yes" && !$('input[name=chk_options]:checked').val()) return null;
                return item.Sizing == $('input[name=r_users]:checked').val() && item.Platform == p;
            });

            var x = uniq(renderData);

            $('#table-wrapper-' + p).renderTable({
                    template: rowTemplate,
                    data: x,
                    defaultSortField: 'Type',
                    defaultSortOrder: 1
            });
        });


        //_.result(_.find(languageData, function(chr) {
        //  return chr.age < 40;
        //}), 'user');

        // update variables
        _.find(languageData, { 'Tags': "x_users" }).Text= $('input[name=r_users]:checked').val().toLowerCase();
        switch ($('input[name=r_users]:checked').val().toLowerCase())
        {
            case "small":
                _.find(languageData, { 'Tags': "x_users_no" }).Text= btoa("< 200");
                break;
            case "medium":
                _.find(languageData, { 'Tags': "x_users_no" }).Text= btoa("200-800");
                break;
            case "large":
                _.find(languageData, { 'Tags': "x_users_no" }).Text= btoa("> 800");
                break;
        }

        if ($('input[name=r_product]:checked').val() == "Sense")
            _.find(languageData, { 'Tags': "x_product" }).Text = btoa("Qlik Sense®");
        else
            _.find(languageData, { 'Tags': "x_product" }).Text = btoa("QlikView®");

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

//    else if (str.indexOf(" ") > -1)

}

function getText(tags) {
    // selected options to variables   
    x_optional = $('input[name="chk_options"]').is(':checked');
    x_physical = $('input[name="chk_Physical"]').is(':checked');
    x_virtual = $('input[name="chk_Virtual"]').is(':checked');
    x_aws = $('input[name="chk_AWS"]').is(':checked');
    x_sense = $('input[name=r_product]:checked').val() == "Sense";
    x_qlikview = $('input[name=r_product]:checked').val() == "QlikView";

    // sort by most tags (?????)
    var z = _.sortBy(languageData, function(n) {
      return n.Tags.split(" ").length;
    }).reverse();

    // get text for language
    var x = _.find(languageData, function(item) {
        var y = item.Language == navigator.language && compareArrays(item.Tags, tags);
        if (y !== undefined)
            return y;
        return item.Language == 'en-US' && compareArrays(item.Tags, tags);
    });

    // no match
    if(x == undefined)
    {
        console.log(tags);
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

    // "" for italic text
    var regex = /\:{2}(.*?)\:{2}/g
    while(result = regex.exec(t)) {
        t = t.replace(result[0], "<em>" + result[1] + "</em>");
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

    languageData.push({"Language":"en-US", "Tags":"x_platform", "Text": btoa(""), "Url": ""});
    languageData.push({"Language":"en-US", "Tags":"x_users", "Text": btoa(""), "Url": ""});
    languageData.push({"Language":"en-US", "Tags":"x_users_no", "Text": btoa(""), "Url": ""});
    languageData.push({"Language":"en-US", "Tags":"x_product", "Text": btoa(""), "Url": ""});

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
        var platform = ['Physical', 'Virtual', 'AWS'];
        var t = "";
        platform.forEach(function(item) {
            t = t + '<div id="table-wrapper-' + item + '">' +
                        '<h5>' + item + '</h5>' +
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

});

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

String.prototype.checkPlatform = function() {
    if ($('input[name=r_product]:checked').val() == "QlikView") {
        if (this == "PUB/Scheduler") return "QlikView Publisher (QVP)";
        if (this == "QVS/Engine") return "QlikView Server (QVS)";
    } else {
        if (this == "PUB/Scheduler") return "Qlik Sense Scheduler (QSS)";
        if (this == "QVS/Engine") return "Qlik Sense Engine (QES)";
        if (this == "Central") return "Qlik Sense Central";
    }
    return this;
};
