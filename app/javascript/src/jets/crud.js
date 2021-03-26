// This file is automatically generated by Jets. It is used by
// app/javascript/packs/application.js.
//
// It handles the delete and update action in an unobstrusive way.
// Code could be improved and is meant to provide only a starting point.

$(function() {
  function handleAll(e) {
    var target = $(e.target);
    if (target.is('a') && target.data("method") == "delete") {
      return handleDelete(e);
    } else if (target.attr('type') == "submit") {
      return handleUpdate(e);
    } else {
      return true;
    }

    e.preventDefault();
  }

  function handleDelete(e) {
    event.preventDefault();
    var link = $(e.target);
    var message = link.data("confirm");
    if (message) {
      var sure = confirm(message);
      if (sure) {
        deleteItem(link);
      } else {
        console.log("Deletion cancelled");
      }
    }
  }

  function handleUpdate(e) {
    var submit = $(e.target);
    var form = submit.closest('form');
    var url = form.attr("action") + '?xhr=true';
    var method = $("input[name=_method]");

    if (method.attr("value") != "put") {
      return true;
    }

    e.preventDefault();
    var data = $(form).serialize();
    $.ajax({
       url: url,
       type: 'PUT',
       data: data,
       dataType: "json",
       success: function(response) {
         window.location.href = response.location;
       },
       error: function(xhr, textStatus, errorThrown) {
         console.log('Error!  Status = ' + xhr.status);
       },
       complete: function(data) {
         console.log("data %o", data);
       }
    });
  }

  function deleteItem(link) {
    var node = link.closest('.jets-element-to-delete');
    node.hide(); // immediately hide element

    var resource = link.attr("href") + '?xhr=true';
    var token = $('meta[name=csrf-token]').attr('content');
    var data = { authenticity_token: token };
    var request = $.ajax({
      url: resource,
      method: "DELETE",
      data: data,
      dataType: "json"
    });

    request.done(function(msg) {
      console.log("msg %o", msg);
      node.remove();
    });

    request.fail(function(jqXHR, textStatus) {
      console.log("textStatus %o", textStatus);
      node.show(); // in the event of a failure re-display the node
    });
  }

  $('body').click(handleAll)
});
