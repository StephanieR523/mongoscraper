// Click function for "save" button
$(".save").on("click", function() {
    var thisId = $(this).attr("data-id");
    $.ajax({
        method: "POST",
        url: "/saved/" + thisId
    }).then(function(data) {
        window.location = "/"
    })
});

// Click function for "delete" (from saved) button
$(".delete").on("click", function() {
    var thisId = $(this).attr("data-id");
    $.ajax({
        method: "POST",
        url: "/delete/" + thisId
    }).then(function(data) {
        window.location = "/"
    })
});

// Click function for "scrape" button
$("#scrape").on("click", function() {
    $.ajax({
        method: "GET",
        url: "/scraped",
    }).then(function(data) {
        console.log(data)
        window.location = "/"
    })
});

// Click function for clearing all articles

// Click function for "note" button
$(".save-note").on("click", function() {
    var thisId = $(this).attr("data-id");
    $.ajax({
        method: "POST",
        url: "/articles/" + thisId,
        data: {
          body: $("#noteText" + thisId).val()
        //   body: $("#noteText").val()
        }
      }).then(function(data) {
          // Log the response
          console.log(data);
          // Empty the notes section
          $("#noteText" + thisId).val("");
          $(".modalNote").modal("hide");
          window.location = "/saved"
    });

});

// Click function for deleting one note
$(".deleteNote").on("click", function() {
    var thisId = $(this).attr("data-note-id");
    $.ajax({
        method: "POST",
        url: "/deleteNote/" + thisId,
      }).then(function(data) {
          // Log the response
          console.log(data);
          window.location = "/saved"
        })
})