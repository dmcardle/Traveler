/* Traveling Salesman Problem code */

var TSP = new function() {

    this.init = function() {
        this.places = [];
        this.service = new google.maps.DistanceMatrixService();
    }

    this.getCostMatrix = function(homeAddress, destinationAddresses, mode) {

        if (typeof(destinationAddresses) !== 'object')
            return;
       
       
        // make a new array [ home, dest1, dest2, ..., destN ]
        var dests = [];
        dests.push(homeAddress);
        for (var i=0; i<destinationAddresses.length; i++) {
            dests.push(destinationAddresses[i]);
        }
       
        // save this array into this.places, so that later we know which city
        // number 2 is, for example
        this.places = dests;
        
        console.log("PLACES =");
        console.log(dests);

        this.service.getDistanceMatrix(
            {
                origins: dests,
                destinations: dests,
                travelMode: google.maps.TravelMode.DRIVING,
                avoidHighways: false,
                avoidTolls: false
            }, 
            callback
        );

        // parses the results of the distance matrix from google maps, creates
        // an NxN distance matrix
        function callback(response, status) {

            var costMatrix = [];

            console.log("RESPONSE");
            console.log(response);

            if(status=="OK") {
               
                //orig.value = response.destinationAddresses[0];
                //dest.value = response.originAddresses[0];
                //dist.value = response.rows[0].elements[0].distance.text;
                
                var respData;
                

                var destinationElements = $(".addressInp");
                respData = response.originAddresses;
                for (var i=0; i<respData.length; i++) {
                    TSP.places[i] = respData[i];

                    if (i === 0) {
                        $("#homeAddressInp").val( respData[i] );   
                    }
                    else {
                        $(destinationElements[i-1]).val( respData[i] );
                    }
                }
                
                
                // create an NxN distance matrix
                respData = response.rows;
                for (var i=0; i<respData.length; i++ ){
                  
                    var thisRow = respData[i].elements;
                     
                    // add a row to the distMatrix
                    costMatrix.push( [] );

                    // add all the values to this row
                    for (var j=0; j<thisRow.length; j++) {
                        var cost;
                        if (mode === 'distance') 
                            cost = thisRow[j].distance.value; 
                        else if (mode === 'duration') 
                            cost = thisRow[j].duration.value;
                        costMatrix[i].push(cost);
                    }
                }

                // solve the TSP
                var tspAnswer = TSP.solveTSP( costMatrix );
                var path = tspAnswer.circuit;
                var cost = tspAnswer.cost;

                // output the best path with its names
                console.log("BEST PATH:");
                for (var i=0; i<path.length; i++) {
                    console.log(TSP.places[path[i]]);
                }

                // rewrite the names of the destinations in the correct order
                var addressInps = $(".addressInp");
                for (var i=0; i<addressInps.length; i++) {
                    // i+1 since we aren't going to reorder dest #1 which is home
                    $(addressInps[i]).val( TSP.places[path[i+1]] );
                }
                
                // write into #resultsDiv the cost of this path
                var resultsHtml = "This path takes <b>" + cost + "</b> ";
                if (mode === 'distance') {
                    resultsHtml += 'meters';
                } else if (mode === 'duration') {
                    resultsHtml += 'seconds';
                }
                resultsHtml += "<br>";
                resultsHtml += "<a href='http://maps.google.com/maps?saddr="+TSP.places[0];
                for (var i=1; i<path.length; i++) {
                    if (i==1)
                        resultsHtml += "&daddr=" + TSP.places[path[i]] + "";
                    else
                        resultsHtml += "+to:" + TSP.places[path[i]];
                }
                resultsHtml += "+to:" + TSP.places[0];
                resultsHtml += "'>Map It!</a>";

                $("#resultsDiv").html(resultsHtml);
                               
            } else {
                alert("Error: " + status);
            }
        }

    }


    // actually solves the traveling salesman problem
    this.solveTSP = function( distMatrix ) {
       
        // create a new city object with "new City()" 
        function City(num, parentCity) {
            this.num = num;       // city number
            this.parentCity = parentCity;    // link to parent
        }



        var rootCity = null;
        var best;
        var circuit = [];
        var numCities = distMatrix.length;

        solve(null, -1);

        console.log("BEST PATH");
        console.log(circuit);
        return {
            circuit: circuit,
            cost: best
        };

        /* Given a path and an inter-city distance matrix, this function
           calculates the total distance of following the path.

           Assumptions
           - n is the length of path
           - values in path are not invalid indices into dist

         */
        function calcDistance(n, path, distMatrix) {
            var i, d;
            var city1, city2;

            // go from city 1 to the first city on the path
            d = 0;

            // add the distance for each of the intermediate cities
            for (i=0; i<n-1; i++) {
                city1 = path[i];
                city2 = path[i+1];
                d += distMatrix[city1][city2];
            }

            return d;
        }


        function solve(node, numChildren) {

            if (rootCity === null) {
                rootCity = new City(0, null);   
                node = rootCity;
                numChildren = numCities; // will become numCities - 1 
                best = -1;
            }
            
            var i, j;
            var pruneBool = false;
            
            numChildren = numChildren - 1;
            var numUnvisited = numChildren;
            var numVisited = numCities - numUnvisited;
            
            // ~~~~~ find unvisited cities ~~~~~
            var citiesBoolArr = [];
            var unvisitedIntArr = [];
            var visitedIntArr = [];
            
            
            // make a list of visited cities by going up the tree
            visitedIntArr.push(node.num); 
            var par = node;
            while (par.parentCity !== null) {
                par = par.parentCity;
                visitedIntArr.push(par.num);
            }
           
            //console.log("VISITED");
            //console.log(visitedIntArr); 
           
            // initialize cities bool array -- represents whether or not
            // a city has been visited
            for (i=0; i<numCities; i++)
                citiesBoolArr[i] = true;
            
            // for each city, if that city has been visited,
            // set that city's value to false
            for (i=0; i<numCities; i++)
                for (j=0; j<numVisited; j++)
                    if (visitedIntArr[j] == i)
                        citiesBoolArr[i] = false;
            
            // for each city, if that city has not been visited,
            // store its value in the unvisited array
            j = 0;
            for (i=0; i<numCities; i++)
                if (citiesBoolArr[i])
                    unvisitedIntArr[j++] = i;

            //console.log("UNVISITED");
            //console.log(unvisitedIntArr);

            // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        
            
            // ~~~~~~~~~~~~~~~~~~~~~~~~ DETERMINE WHETHER TO PRUNE BRANCH ~~~~~~~~~~~~~~~~~~~
            // reverse the path so it begins at 0
            visitedIntArr.reverse();
            
            // calculate total distance of path
            var cost = calcDistance(numVisited, visitedIntArr, distMatrix);
            //console.log("COST = " + cost + " for array");
            //console.log(visitedIntArr);
            
            // if we have no more cities to visit, make a complete circuit
            // by going back home
            if (numUnvisited === 0) {
                cost += distMatrix[ visitedIntArr[numVisited-1] ][0];
            }


            // if we are at a leaf node
            if (numUnvisited === 0) {
                // if this is the best path so far
                if (best === -1 || cost < best) {
                    //console.log("BEST PATH SO FAR");
                    //console.log(visitedIntArr);
                        
                    // save best cost
                    best = cost;

                    // save best path            
                    for (i=0; i<numVisited; i++) {
                        circuit[i] = visitedIntArr[i];
                    }
                }    
            }
            // not at a leaf node
            else {

                // if this path already costs more than the best path, then there's
                // no point in pursuing the permutations of the remaining cities
                //
                //      lb = min(dist)* (numUnvisited+1)
                // 
                // note that it is one more than numUnvisited because we need to make
                // a complete circuit; we need to return to city 0
                //
                // find min(dist)...
                var lowerBound = distMatrix[0][1];
                for (i=0; i<numCities; i++)
                    for(j=0; j<numCities; j++)
                        if (i != j && distMatrix[i][j] < lowerBound)
                            lowerBound = distMatrix[i][j];
                lowerBound *= numUnvisited+1;

                // To prune, or not to prune, that is the question...
                pruneBool = (best !== -1 && cost + lowerBound > best);
            
                if (!pruneBool && numChildren > 0) {

                    // create each child below this node
                    for (i=0; i<numChildren; i++) {

                        //if (numChildren !== numCities-1)  {

                        //console.log("RECURSING on city #" + unvisitedIntArr[i]);

                        // since this is a Depth-First Search, we only need to
                        // allocate the one child City
                        var child = new City(
                                unvisitedIntArr[i], // check out unvisited city i
                                node                // parent of child is this node
                                );

                        // recurse on the child node
                        solve(child, numChildren);
                        //} 
                    }
                }
                // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            }
        }
    }
}
