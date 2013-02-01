var UI = new function() {
    this.init = function() {
        $("#addDestButton").on('click', this.addNewDest);
        $("#lookupButton").on('click', this.lookupAddresses);
        $("#solveButton").on('click', this.actuallySolveTSP);
        $(".removeButton").live('click', this.removeThisDestination);

        // leave the page with a total of two addresses -- otherwise, what is
        // the point of this tool?
        this.addNewDest();
    }
    this.addNewDest = function() {
        var count = $(".destinationBlock").length;

        if (count < 10) {
            // copy the first destination block
            var newDestBlock = $(".destinationBlock").first().clone();

            // set all inputs' values to ""
            $(newDestBlock).find("input:not(.removeButton)").val("");

            // add the new destination block to the bottom
            $(".allDestinations").append( newDestBlock );
        }
    }

    this.lookupAddresses = function() {
        UI.solveTSP(UI.rewriteAddresses);
    }
    this.actuallySolveTSP = function() {
        UI.solveTSP(TSP.handleResponse);
    }
    this.solveTSP = function(whichCallback) {
        // get home address
        var homeAddress = $("#homeAddressInp").val();
        
        // get destinations
        var destinations = [];
        $(".address .addressInp").each( function() {
            destinations.push( $(this).val() );
        });

        // determine mode
        TSP.mode = $("#modeSelectDiv input[name=mode]:checked").val();
        

        // solve TSP
        TSP.getCostMatrix(homeAddress, destinations, whichCallback);
    }

    this.rewriteAddresses = function(response, status) {

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

    }

    this.removeThisDestination = function() {

        // count the destination addresses
        var count = $(".destinationBlock").length;
        
        if (count > 2)
            $(this).parents(".destinationBlock").remove();
    }
}
