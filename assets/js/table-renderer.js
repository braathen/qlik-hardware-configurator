(function($) {
    $.fn.renderTable = function( options ) {

        var settings = $.extend({
            template: "",
            data: {},
            pagination: {
                rowPageCount: 3
            },
            defaultSortField: '',
            defaultSortOrder: 1
        }, options );


        //Check object helper
        var hasOwnProperty = Object.prototype.hasOwnProperty;
        function isEmpty(obj) {
            if (obj == null) return true;
            if (obj.length > 0)    return false;
            if (obj.length === 0)  return true;
            for (var key in obj) {
                if (hasOwnProperty.call(obj, key)) return false;
            }
            return true;
        }

        //Sort array of objects
        //sortOrder: '-1' == desc, '1' == 'asc';
        function objComparator(property, sortOrder) {
            sortOrder = sortOrder || 1;
            if(property[0] === "-") {
                sortOrder = -1;
                property = property.substr(1);
            }
            return function (a,b) {
                var result;
                if (typeof a[property] === "string" && typeof b[property] === "string") {
                    result = (a[property].toLowerCase() < b[property].toLowerCase()) ? -1 : (a[property].toLowerCase() > b[property].toLowerCase()) ? 1 : 0;
                }
                else {
                    result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
                }
                return result * sortOrder;
            }
        }

        //Template engine
        function templateEngine(html, options) {
            var re = /<%([^%>]+)?%>/g, reExp = /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g, code = 'var r=[];\n', cursor = 0, match;
            var add = function(line, js) {
                js? (code += line.match(reExp) ? line + '\n' : 'r.push(' + line + ');\n') :
                    (code += line != '' ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n' : '');
                return add;
            };
            while(match = re.exec(html)) {
                add(html.slice(cursor, match.index))(match[1], true);
                cursor = match.index + match[0].length;
            }
            add(html.substr(cursor, html.length - cursor));
            code += 'return r.join("");';
            return new Function(code.replace(/[\r\t\n]/g, '')).apply(options);
        }

        //Get number of total pages
        function getTotalPagesNumber(list){
            return Math.ceil(list.length / settings.pagination.rowPageCount);
        }

        //Public
        return this.each(function(){

            var $this = $(this),
                tempContainer = '',
                totalPages = getTotalPagesNumber(settings.data),
                activePage = 1,
                filtersObject = {},
                sortField = settings.defaultSortField,
                sortOrder = settings.defaultSortOrder;

            //filter
            function applyFilter(objList) {
                if( isEmpty(filtersObject) ) return objList;

                var result = [],
                    searchedStr = '';

                for ( var i = 0; i < objList.length; i++){
                    var filtered = true;

                    for (var filter in filtersObject ){

                        if( objList[i].hasOwnProperty(filter) ){

                            //Filter by string
                            if( typeof(filtersObject[filter]) == 'string'){
                                searchedStr = filtersObject[filter].toLowerCase();

                                if( (objList[i][filter]).toLowerCase().indexOf(searchedStr) == -1 ){
                                    filtered = false;
                                }

                            //Filtering by some array ('or' filtering)
                            }else if(Array.isArray(filtersObject[filter])){
                                var orFiltered = false;
							
                                for (var k = 0; k < filtersObject[filter].length; k++){
                                    searchedStr = filtersObject[filter][k].toLowerCase();

                                    if( (objList[i][filter]).toLowerCase().indexOf(searchedStr) > -1 ){
                                        orFiltered = true;
                                    }
                                }
                                if( !orFiltered && filtersObject[filter].length) filtered = false;

                            // Filtering by date
                            }else if( filtersObject[filter].startDate != 'undefined' && filtersObject[filter].endDate != 'undefined'){
                                var checkedDate = new Date(objList[i][filter]),
                                    startDate = new Date(filtersObject[filter].startDate),
                                    endDate = new Date(filtersObject[filter].endDate);
                                    
                                    checkedDate.setHours(0,0,0,0);
                                    startDate.setHours(0,0,0,0);
                                    endDate.setHours(0,0,0,0);

                                if ( (checkedDate < startDate || checkedDate > endDate) ) {
                                    filtered = false;
                                }
                            }
                        }

                    }
                    if (filtered)  result.push(objList[i]);
                }
                return result;
            }

            //Methods
            function addPagination(totalPagesNumFiltered, targetPage){
                var tempPaginationContainer = '',
                    //cached button elements
                    $nextButton = $this.find('a.to-next'),
                    $prevButton = $this.find('a.to-previous'),
                    $toLastButton = $this.find('a.to-last'),
                    $toFirstButton = $this.find('a.to-first');

                totalPagesNumFiltered = totalPagesNumFiltered || totalPages;
                targetPage = targetPage || 1;

                /*Pagination-->*/
                var paginationObj = function () {
                    // Constructor
                    function paginationObj(params) {
                        this.params = params;
                    }

                    // Method to generate Html for element, depends on type param
                    paginationObj.prototype.generateHtml = function() {
                        if(this.params.type === 'page') {
                            return '<span class="to-page btn btn-primary">'+ this.params.pageNumber +'</span>';
                        }else if(this.params.type === 'activePage') {
                            return '<span class="to-page btn btn-primary active">'+ this.params.pageNumber +'</span>';
                        }else if(this.params.type === 'divider') {
                            return '<div class="page-divider">...</div>';
                        }else{
                            console.log('invalid type for paginationObj: '+this.params.type);
                        }
                    }

                    return paginationObj;
                }();

                var res = [];
                for (var i = 1; i <= totalPagesNumFiltered; i++) {
                    if(i === activePage){
                        // Adding 'Active page' element
                        res.push(new paginationObj({'pageNumber':i, 'type': 'activePage'}));
                    }else if(i<=2 || i >= totalPagesNumFiltered-1) {
                        // Adding 'Page' if current element not one of 2 first ol 2 last elements
                        res.push(new paginationObj({'pageNumber':i, 'type': 'page'}));
                    }else{
                        if(totalPagesNumFiltered <= 7) {
                            // If number of pages 7 or less, we dont need any dividers. Adding 'page' element to array
                            res.push(new paginationObj({'pageNumber':i, 'type': 'page'}));
                        } else {
                            // Adding 'Divider' element
                            if(res[res.length-1].params.type !== 'divider') {
                                // Only one divider in the row
                                res.push(new paginationObj({'type': 'divider'}));
                            }
                        }
                    }
                }

                res.forEach(function(entry) {
                    tempPaginationContainer += entry.generateHtml();
                });
                /*<--Pagination*/

                if( targetPage !== totalPagesNumFiltered && targetPage !== 1 ){
                    $nextButton.removeClass('disabled');
                    $prevButton.removeClass('disabled');
                    $toLastButton.removeClass('disabled');
                    $toFirstButton.removeClass('disabled');
                }

                if( targetPage == totalPagesNumFiltered ){
                    if( !$nextButton.hasClass('disabled') ) {$nextButton.addClass('disabled');}
                    if( !$toLastButton.hasClass('disabled') ) {$toLastButton.addClass('disabled');}
                    $prevButton.removeClass('disabled');
                    $toFirstButton.removeClass('disabled');
                }

                if( targetPage == 1 && targetPage !== totalPagesNumFiltered ){
                    if( !$prevButton.hasClass('disabled') ) {$prevButton.addClass('disabled')}
                    if( !$toFirstButton.hasClass('disabled') ) {$toFirstButton.addClass('disabled')}
                    $nextButton.removeClass('disabled');
                    $toLastButton.removeClass('disabled');
                }

                if( totalPagesNumFiltered === 1 ) {
                    if( !$nextButton.hasClass('disabled') ) {$nextButton.addClass('disabled')}
                    if( !$prevButton.hasClass('disabled') ) {$prevButton.addClass('disabled')}
                    if( !$toLastButton.hasClass('disabled') ) {$toLastButton.addClass('disabled')}
                    if( !$toFirstButton.find('a.to-first').hasClass('disabled') ) {$toFirstButton.addClass('disabled')}
                }

                $this.find('.pagination-pages').html(tempPaginationContainer);
            }

            function switchPage(e){
                e.preventDefault();

                var $element = $(e.target),
                    targetPage,
                    startPoint,
                    endPoint,
                    filteredList = applyFilter(settings.data),
                    totalPages = getTotalPagesNumber(filteredList);

                filteredList.sort(objComparator(sortField, sortOrder));

                if( $element.hasClass('active') || $element.hasClass('disabled') || $element.hasClass('dots') ) return false;

                //Define target page number by element class
                if( $element.hasClass('to-page') ){
                    targetPage = parseInt($element.html());
                }else if( $element.hasClass('to-next') ){
                    targetPage = activePage + 1;
                }else if( $element.hasClass('to-previous') ){
                    targetPage = activePage - 1;
                }else if( $element.hasClass('to-last') ){
                    targetPage = totalPages;
                }else if( $element.hasClass('to-first') ){
                    targetPage = 1;
                }

                //Define start index for data list
                startPoint = (targetPage - 1)* settings.pagination.rowPageCount;

                //Define last index for data list
                endPoint = Math.min(startPoint + settings.pagination.rowPageCount, filteredList.length);

                tempContainer = '';

                for (var i = startPoint; i < endPoint; i++){
                    tempContainer += templateEngine(settings.template, filteredList[i]);
                }

                $this.find('tbody').html(tempContainer);

                activePage = targetPage;

                //active styles
                $this.find('.pagination-pages').find('span').removeClass('active');
                $this.find('.pagination-pages').find('span').eq(targetPage - 1).addClass('active');

                addPagination(totalPages, targetPage);
            }

            function renderRows( dataList ){

                var renderObject = applyFilter(dataList),
                    tempContainer = '';

                renderObject.sort(objComparator(sortField, sortOrder));

                var rowsCountToRender = Math.min(settings.pagination.rowPageCount, renderObject.length);

                for (var i = 0; i < rowsCountToRender; i++){
                    tempContainer += templateEngine(settings.template, renderObject[i]);
                }

                if( isEmpty(tempContainer) ){
                    var colsNumber;
                    colsNumber = $this.find('thead tr th').length;
                    tempContainer = '<tr><td class="empty-list-message" colspan='+ colsNumber +'>No data</td><tr>';
                    $this.find('tbody').html(tempContainer);
                    addPagination(1);
                }else{
                    $this.find('tbody').html(tempContainer);
                    addPagination(getTotalPagesNumber(renderObject));
                }
            }
			
			
		   function setSortingIconForDefaultColumnHeader() {

			   if (sortField) {
			   
				   var columnHeaderToBeSortedByDefault = $this.find('.sortable-column[data-sort="' + sortField + '"]');

				   
				   if (sortOrder == -1) {
					   columnHeaderToBeSortedByDefault.addClass('desc');
						
				   } else {
					   columnHeaderToBeSortedByDefault.removeClass('desc');	
					
				   }
					
			   }
				
		   }

		   
            setSortingIconForDefaultColumnHeader();
			
            renderRows(settings.data);

			
            //events
            $this.on('click', '.pagination-pages span', switchPage);
            $this.on('click', '.pagination-buttons a', switchPage);

            //Filter events

            //text filter event
            $this.find('.filter').find('input[type=text]').on('change keyup', function(){
                var $this = $(this),
                    filterValue,
                    filterProp = $this.attr("data-filter");

                if( $this.val().length > 0 ){
                    filterValue = $this.val();
                    filtersObject[filterProp] = filterValue;
                }else if( $this.val() == 0 ){
                    if( filtersObject[filterProp] ){
                        delete filtersObject[filterProp]
                    }
                }
                activePage = 1;
                renderRows(settings.data);
            });

            //checkboxes filter event
            $this.find('.filter').find('input[type=checkbox]').on('change', function(){
                var $this = $(this),
                    filterValue = $this.attr("data-value"),
                    filterProp = $this.attr("data-filter");

                if( $this.prop('checked') ) {
                    if ( filtersObject.hasOwnProperty(filterProp) ){
                        filtersObject[filterProp].push(filterValue);
                    }else{
                        filtersObject[filterProp] = [filterValue];
                    }
                }else{
                    if ( filtersObject.hasOwnProperty(filterProp) ){
                        for (var i = 0; i < filtersObject[filterProp].length; i++){
                            if( filtersObject[filterProp][i].toLowerCase().indexOf(filterValue.toLowerCase()) > -1 ){
                                filtersObject[filterProp].splice(i, 1);
                            }
                        }
                    }
                }
                activePage = 1;
                renderRows(settings.data);
            });

            //date filter event
            $this.find('.filter').on('change', 'input[type=date], input[type=text].date', function(){
                var $this = $(this),
                    filterValue = $this.val(),
                    filterProp = $this.attr("data-filter");
                    if(!filtersObject[filterProp]){
                        filtersObject[filterProp] = {};
                    }

                    if( $this.hasClass('startDate') ){
                        filtersObject[filterProp].startDate = filterValue;
                    }else if( $this.hasClass('endDate') ){
                        filtersObject[filterProp].endDate = filterValue;
                    }
                activePage = 1;
                renderRows(settings.data);
            });

            //Sort event
            $this.find('.sortable-column').on('click', function(){
                var $this = $(this),
                    desc = $this.hasClass('desc');
                $('.sortable-column').removeClass('desc');

                if(desc){
                    $this.removeClass('desc');
                }else{
                    $this.addClass('desc');
                }


                sortField = $this.attr("data-sort");
                sortOrder = $this.hasClass('desc')? -1 : 1;

                activePage = 1;
                renderRows(settings.data);
            });

        });

    };
})(jQuery);

