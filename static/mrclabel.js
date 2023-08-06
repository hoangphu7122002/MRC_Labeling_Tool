var focusId = 0;
var ansIndex = [];
var articleId = 0;
var maxArticle = 0;

$(document).ready(function() {
  init();
});

function init() {
  ansIndex.push({ start: 0, end: 0, text: 0 });

  newRow();
  getNewArticleNext();
  setPassageEvent();
  
  $("#submit-article").click(submitArticle);
  $("#switch-article-next").click(switchArticleNext);
  $("#switch-article-prev").click(switchArticlePrev);
//   $("#submit-page").click(switchArticleNow);
  $("#submit-page").click(submitPage)
  $("#sendBtn").click(function() {
    generateQA(ansIndex);
  });
}

function getRowCount() {
    return $('.row.p-1').length;
}

function setPassageEvent() {

    let passageSelectionStart = 0;
    let passageSelectionEnd = 0;

    // stop event
    $("#passage").off('select');
    // start event
    $("#passage").select(function (e) {
        focusId = getRowCount() - 1;

        let passage = $("#passage").val();
        let msgTarget = ".index-label:eq(" + focusId + ")";
        let textTarget = ".answer-box:eq(" + focusId + ")";

        passageSelectionStart = e.target.selectionStart;
        passageSelectionEnd = e.target.selectionEnd;

        ansIndex[focusId]["start"] = passageSelectionStart;
        ansIndex[focusId]["end"] = passageSelectionEnd;

        let selectedText = passage.substring(
            passageSelectionStart,
            passageSelectionEnd
        );

        ansIndex[focusId]["text"] = selectedText;

        message = "" + passageSelectionStart + "-" + passageSelectionEnd;
        $(msgTarget).empty();
        $(msgTarget).append(message);

        $(textTarget).val(selectedText);

        // Unselect the text
        window.getSelection().removeAllRanges();

    });
}

function getNewArticleNow() {
    // Setup paragraph.
    $.get('/submit', function (data) {
        $('#passage').val(data.article);
        $('#question').val(data.question);
        $('#max-article').val('/' + data.maxArticle);
        articleId = data.article_id;
        
    });
}

function getNewArticleNext() {
    // Setup paragraph.
    $.get('/next', function (data) {
        $('#passage').val(data.article);
        $('#question').val(data.question);
        $('#max-article').val('/' + data.maxArticle);
        articleId = data.article_id;
        
    });
}

function getNewArticlePrev() {
    // Setup paragraph.
    $.get('/prev', function (data) {
        $('#passage').val(data.article);
        $('#question').val(data.question);
        articleId = data.article_id;
        maxArticle = data.maxArticle;
    });
}

function switchArticleNow() {
    focusId = 0;
    ansIndex = [];
    articleId = 0;
    getNewArticleNow();
    flushQA();
    setPassageEvent();
}

function switchArticleNext() {
    focusId = 0;
    ansIndex = [];
    articleId = 0;
    getNewArticleNext();
    flushQA();
    setPassageEvent();
}

function switchArticlePrev() {
    focusId = 0;
    ansIndex = [];
    articleId = 0;
    getNewArticlePrev();
    flushQA();
    setPassageEvent();
}

function newRow() {
    let rowParent = $('<div />', {
        "class": 'row p-1'
    });
    let colParent = $('<div />', {
        "class": 'offset-md-2 col-md-8'
    });
    let flexContainer = $('<div />', {
        "class": 'd-flex'
    });
    
    // Add-row button placeholder.
    let btnAddCont = $('<div />', {
        "class": 'p-2 flex-shrink-1 bg-li'
    });
    // Remove-row button placeholder.
    let btnDelCont = $('<div />', {
        "class": 'p-2 flex-shrink-1 bg-li'
    });
    // Modify button placeholder.
    let btnModCont = $('<div />', {
        "class": 'p-2 flex-shrink-1 bg-li'
    });
    let qboxCont = $('<div />', {"class": 'p-2 flex-fill bg-secondary'});
    let aboxCont = $('<div />', {"class": 'p-2 flex-fill bg-success'});
    let labelCont = $('<div />', {
        "class": 'p-2 flex-shrink-10 bg-success',
        "style": "width: 100px;"
    });

    // Add-row button
    btnAddCont.append($('<button type="button" class="btn  bg-primary add-btn">+</button>').click(addBtnEventHandler));

    // Remove-row button
    btnDelCont.append($('<button type="button" class="btn bg-danger del-btn">-</button>').click(delBtnEventHandler));

    // question box
    qboxCont.append($('<input type="text" class="form-control question-box" placeholder="Your Question" />'));

    // answer box
    aboxCont.append($('<input readonly type="text" class="form-control answer-box" placeholder="Selected Answer" />'));

    // label
    labelCont.append($('<label class="index-label">n/a</label>'));


    flexContainer.append(btnAddCont);
    flexContainer.append(btnDelCont);
    flexContainer.append(btnModCont);
    flexContainer.append(qboxCont);
    flexContainer.append(aboxCont);
    flexContainer.append(labelCont);

    colParent.append(flexContainer);
    rowParent.append(colParent);
    $('#qarow').append(rowParent);
}

function addBtnEventHandler(ev) {
    // Check if any row has no selected text
    let anyRowNotSelected = ansIndex.some((ansObj) => ansObj.start === 0 && ansObj.end === 0);
  
    if (anyRowNotSelected) {
      Swal.fire({
        icon: "warning",
        title: "Oops...",
        text: "!!!row!!!。",
      });
    } else {
      var ansObj = { start: 0, end: 0, text:0};
      ansIndex.push(ansObj);

      newRow();
      reassignIds();
      focusId = getRowCount() - 1;
    }
  }

function flushQA() {
    // Clear all rows except the first one
    $(".row.p-1").not(":first").remove();
    ansIndex = [{"start": 0, "end": 0, "text": 0}];
    // Clear the remaining row's inputs
    $("#question-0").val("");
    $("#answer-0").val("");
    $("#index-0").text("n/a");
}

function generateQA(rawQAPair) {
    for (let i = 0; i < getRowCount(); i++) {
        let qText = $("#question-" + i).val();
        rawQAPair[i]['article_id'] = articleId;
        rawQAPair[i]['answer_start'] = rawQAPair[i]['start'];
        rawQAPair[i]['answer_string'] = rawQAPair[i]['text'];
        rawQAPair[i]['question'] = qText;
    }

    // Push json to backend.
    console.log(rawQAPair);
    $.ajax({
        type: "POST",
        url: '/question-answer',
        data: JSON.stringify(rawQAPair),
        contentType: "application/json",
        success: function (data) {
            flushQA();
            Swal.fire({
                icon: 'success',
                title: '',
                text: 'Success!',
            });
            console.log(data);
        },
        error: function (xhr, status, error) {
            Swal.fire({
                icon: 'error',
                title: '',
                text: 'Error!',
            });
            console.log("Error: " + error);
        }
    });
}

/**
 * Event handler of delete button.
 * @param {*} ev Event object
 */
function delBtnEventHandler(ev) {
    let rowId = Number($(ev.target).data("row-id"));
    let rowCount = getRowCount();

    if (rowCount > 1) {
        let row = $(ev.target).closest(".row");
        row.remove();
        ansIndex.splice(rowId, 1);
        reassignIds();
        focusId = getRowCount() - 1;

    } else {
        Swal.fire({
            icon: "error",
            title: "d",
            text: "ERROR",
        });
    }
}

function submitPage() {
    let page_id = $("#page_id").val();
    $.ajax({
        type: "POST",
        url: "/submit",
        data: {
            page_id: page_id,
        },
        success: function (response) {
            console.log(response);
            $("#passage").val(response["article"])
            $("#question").val(response["question"])
        },
        error: function (xhr, status, error) {
            $("#passage").val("")
            $("#question").val("")
            Swal.fire({
                icon: "error",
                title: "",
                text: "Error",
            });
        },
    });
}

function submitArticle() {
    // Get form data
    let article = $("#article").val();
    let description = $("#description").val();

    // Send the data using an AJAX POST request
    $.ajax({
        type: "POST",
        url: "/article",
        data: {
            description: description,
            article: article,
        },
        success: function (response) {
            $("#description").val("");
            $("#article").val("");
            Swal.fire({
                icon: "success",
                title: "",
                text: "SUCCESS",
            });
        },
        error: function (xhr, status, error) {
            Swal.fire({
                icon: "error",
                title: "",
                text: "Error",
            });
        },
    });
}


function reassignIds() {
    $('.row.p-1').each(function (index, row) {
        let btnAdd = $(row).find('.btn-add');
        let btnDel = $(row).find('.btn-del');
        let btnMod = $(row).find('.btn-mod');
        let questionBox = $(row).find('.question-box');
        let answerBox = $(row).find('.answer-box');
        let indexLabel = $(row).find('.index-label');

        btnAdd.attr('id', 'addbtn-' + index);
        btnDel.attr('id', 'delbtn-' + index);
        btnMod.attr('id', 'addbtn-' + index);
        questionBox.attr('id', 'question-' + index);
        answerBox.attr('id', 'answer-' + index);
        indexLabel.attr('id', 'index-' + index);
    });
}