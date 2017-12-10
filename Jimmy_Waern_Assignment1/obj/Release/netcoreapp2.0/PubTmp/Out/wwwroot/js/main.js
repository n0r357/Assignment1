$(document).ready(function () {
    var cancelButton = $("#cancelButton button");
    var createButton = $("#createButton button");

    var customerForm = $("#customerForm");
    var firstName = $('#firstName');
    var lastName = $('#lastName');
    var email = $('#email');
    var gender = $('#gender');
    var age = $('#age');

    var customerTable = $('#customerTable');

    String.prototype.format = function () {
        var str = this;
        for (var i = 0; i < arguments.length; i++) {
            var reg = new RegExp("\\{" + i + "\\}", "gm");
            str = str.replace(reg, arguments[i]);
        }
        return str;
    }

    getCustomers();

    function getCustomers() {
        $.ajax({
            url: "api/customer",
            type: "GET"
        }).done(function (result) {
            customerTable.empty();
            $.each(result, function (index, customer) {
                var row = $("<tr></tr>");
                row.append(createCustomerRow(customer));
                row.appendTo(customerTable);
            });
        }).fail(function (xhr, status, error) {
            var log = logFormat("Customer Get Failed", xhr, status, error);
            saveLog(log);
        });
    }

    function createCustomerRow(customer) {
        return "<td>" + customer.id + "</td>" +
            "<td>" + customer.firstName + "</td>" +
            "<td>" + customer.lastName + "</td>" +
            "<td>" + customer.email + "</td>" +
            "<td>" + customer.gender + "</td>" +
            "<td>" + customer.age + "</td>" +
            "<td>" + customer.created + "</td>" +
            "<td>" + customer.edited + "</td>" +
            "<td><button id='" + customer.id + "' class='btn btn-warning editButton'><i class='fas fa-pencil-alt'></i></button></td>" +
            "<td><button id='" + customer.id + "' class='btn btn-danger removeButton'><i class='fas fa-trash-alt'></i></button></td>";
    }

    $(document).on("click", ".create", function () {
        var customer = {};
        customer.firstName = firstName.val();
        customer.lastName = lastName.val();
        customer.email = email.val();
        customer.gender = gender.val();
        customer.age = age.val();
        $.ajax({
            url: "api/customer/",
            type: "POST",
            data: customer
        }).done(function (name) {
            getCustomers();
            resetForm();
            saveLog("Customer: " + name + " Created");
        }).fail(function (xhr, status, error) {
            var log = logFormat("Customer Create Failed", xhr, status, error);
            saveLog(log);
        });
    });

    $(document).on("click", ".editButton", function () {
        var id = $(this).attr("id");
        $.ajax({
            url: "api/customer/" + id,
            type: "GET",
            success: function (customer) {
                firstName.val(customer.firstName);
                lastName.val(customer.lastName);
                email.val(customer.email);
                gender.val(customer.gender);
                age.val(customer.age);
                editCustomer(id);
            }
        });
    });

    function editCustomer(id) {
        cancelButton.text("Avbryt").removeClass("clear").addClass("cancel");
        createButton.text("Spara ändring").removeClass("create").addClass("edit").attr("id", id);
    }

    $(document).on("click", ".edit", function () {
        var id = $(this).attr("id");
        var customer = {};
        customer.id = id;
        customer.firstName = firstName.val();
        customer.lastName = lastName.val();
        customer.email = email.val();
        customer.gender = gender.val();
        customer.age = age.val();

        var request = new window.XMLHttpRequest();

        var edit = $.ajax({
            url: "/api/customer",
            type: "PUT",
            data: customer
        }).done(function () {
            getCustomers();
            resetForm();
            createButton.text("Skapa kund").removeClass("edit").addClass("create");
            saveLog("CustomerId: " + id + " Edited");
        }).fail(function (xhr, status, error) {
            var log = logFormat("Customer Edit Failed", xhr, status, error);
            saveLog(log);
            });

        $(document).on('click', '.cancel', function (e) {
            request.abort();
            cancelButton.text("Rensa").removeClass("cancel").addClass("clear");
        });
    });

    $(document).on("click", ".removeButton", function () {
        var id = $(this).attr("id");
        $.ajax({
            url: "api/customer/",
            type: "DELETE",
            data: { "id": id }
        }).done(function (result) {
            getCustomers();
            saveLog("CustomerId: " + id + " Deleted");
        }).fail(function (xhr, status, error) {
            var log = logFormat("Customer Delete Failed", xhr, status, error);
            saveLog(log);
        });
    });

    $(document).on("click", ".seed", function () {
        $.ajax({
            url: "/api/customer/seed",
            type: "GET"
        }).done(function () {
            saveLog("Database Seeded");
            getCustomers();
        }).fail(function (xhr, status, error) {
            var log = logFormat("DB Seed Failed", xhr, status, error);
            saveLog(log);
        });
    });

    $(document).on("click", ".logger", function () {
        $.ajax({
            url: "/api/customer/getlog",
            type: "GET"
        }).done(function (log) {
            window.location.href = "/api/customer/getlog";
            console.log(log);
        }).fail(function (xhr, status, error) {
            var log = logFormat("Log Retrieve Failed", xhr, status, error);
            saveLog(log);
        });
    });

    function saveLog(log) {
        $.ajax({
            url: "api/customer/savelog",
            type: "POST",
            data: { "log": log }
        }).done(function () {
            console.log("Log Saved");
        }).fail(function (xhr, status, error) {
            alert("Log Save Failed")
        });
    }

    function resetForm() {
        customerForm.find("input").val("");
        gender.val("Man");
    }

    function logFormat(message, xhr, status, error) {
        return "{0} - {1} - {2} - {3}".format(message, error, xhr.status, status);
    }
});