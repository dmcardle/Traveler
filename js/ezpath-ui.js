var UI = new function() {
    this.init = function() {
        $("#addDestButton").on('click', this.addNewDest);
        $("#solveButton").on('click', this.solveTSP);
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
    this.solveTSP = function() {
        // get home address
        var homeAddress = $("#homeAddressInp").val();
        
        // get destinations
        var destinations = [];
        $(".address .addressInp").each( function() {
            destinations.push( $(this).val() );
        });

        // determine mode
        var mode = $("#modeSelect").val();

        // solve TSP
        TSP.getCostMatrix(homeAddress, destinations, mode);

    }
    this.removeThisDestination = function() {
        // count the destination addresses
        var count = $(".destinationBlock").length;
        
        if (count > 2)
            $(this).parents(".destinationBlock").remove();
    }
}
