$(document).ready(function () {
    $("#status").val("public")
    $("#public-button").css('background-color', '#c76d00');

    $("#private-button").click(function () {
        $(this).css('background-color', '#c76d00');
        $("#public-button").css('background-color', '#e89c23')

        $("#status").val("private")
    });

    $("#public-button").click(function () {
        $(this).css('background-color', '#c76d00');
        $("#private-button").css('background-color', '#e89c23')

        $("#status").val("public")
    });

    $("#share-button").click(uploadMeme)
    var options = {
        beforeSubmit: showRequest,  // pre-submit callback
        success: showResponse  // post-submit callback
    };

    // bind to the form's submit event
    $('#frmUploader').submit(function () {
        $(this).ajaxSubmit(options);
        return false;
    });

    $("#upload").click(prepareUpload)

    $("span.share").click(prepareShare)
    $("div#share").click(shareMeme)

    //$(".chosen_users").chosen();
    $("ul#share_users").tagit();
    $("ul#upload_share").tagit();
    $("ul#upload_tags").tagit();
    
    prepareFile()
})

function prepareUpload() {
    let username = $("span.username").attr("data-name")
    $("ul#upload_share").tagit("removeAll");
    $.ajax({
        url: '../user/getUsers',
        method: 'GET',
        data: { username },
        success: function (res) {
            users = []
            for (i = 0; i < res.users.length; i++)
                users.push(res.users[i].username)
            $("ul#upload_share").tagit({
                availableTags: users,
                beforeTagAdded: function (event, ui) {
                    if ($.inArray(ui.tagLabel, users) == -1) {
                        return false;
                    }
                },
                showAutocompleteOnFocus:true
            });
        }
    })
    $(".upload_modal").modal('show')
}

function prepareShare() {
    let username = $("span.username").attr("data-name")
    //$("ul#share_users li").remove()
    $("ul#share_users").tagit("removeAll");
    $.ajax({
        url: '../user/getUsers',
        method: 'GET',
        data: { username },
        success: function (res) {
            users = []
            for (i = 0; i < res.users.length; i++)
                users.push(res.users[i].username)
            $("ul#share_users").tagit({
                availableTags: users,
                beforeTagAdded: function (event, ui) {
                    if ($.inArray(ui.tagLabel, users) == -1) {
                        return false;
                    }
                }
            });
        }
    })

    let id = $(this).attr('data-id')
    $.post(
        '../meme/viewMeme',
        { id },
        function (data, status) {
            if (status === 'success') {
                for (i = 0; i < data.meme.shared_users.length; i++) {
                    $('ul#share_users').tagit('createTag', data.meme.shared_users[i]);
                }
            }
        })

    $("form#shareMeme").attr("data-id", id)
    $(".share_modal").modal('show')
}

function shareMeme() {
    let shared_users = $("ul#share_users").tagit("assignedTags");
    let id = $("form#shareMeme").attr("data-id")

    $.ajax({
        url: '../meme/updateSharedUsers',
        method: 'GET',
        data: { id, shared_users },
        success: function (res) {
            $(".share_modal").modal('hide')
        }
    })
}

function prepareFile() {
    const realFileBtn = document.getElementById("real-file");
    const customBtn = document.getElementById("custom-button");
    const customTxt = document.getElementById("custom-text");

    customBtn.addEventListener("click", function () {
        realFileBtn.click();
    })

    realFileBtn.addEventListener("change", function () {
        if (realFileBtn.value) { //if a file is chosen
            let filename = realFileBtn.value.match(/[\/\\]([\w\d\s\.\-\(\)]+)$/)[1]
            customTxt.innerHTML = filename;
            $("#hiddenFile").val(filename)
            console.log($("#hiddenFile").val())
        } else
            customTxt.innerHTML = "No meme chosen yet";
    })
}

function showRequest(formData, jqForm, options) {
    // alert('Uploading is starting.');
    return true;
}

// post-submit callback
function showResponse(responseText, statusText, xhr, $form) {
    if (statusText === "success") {
        let tagArray = $("ul#upload_tags").tagit("assignedTags");
        for (i = 0; i < tagArray.length; i++) {
            let cur = $("input[name=tags_upload]").val()
            $("input[name=tags_upload]").val(cur + " " + tagArray[i])
        }

        let shareArray = $("ul#upload_share").tagit("assignedTags");
        for (i = 0; i < shareArray.length; i++) {
            let cur = $("input[name=share_upload]").val()
            $("input[name=share_upload]").val(cur + " " + shareArray[i])
        }

        
        $("#uploadForm").submit()
    }
    //alert('status: ' + statusText + '\n\nresponseText: \n' + responseText );
}

function uploadMeme() {
    $('#frmUploader').submit()
}