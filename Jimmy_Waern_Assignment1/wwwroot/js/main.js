$(document).ready(function () {
    var button = $("#button button");

    var customerForm = $("#customerForm");
    var firstName = $('#firstName');
    var lastName = $('#lastName');
    var email = $('#email');
    var gender = $('#gender');
    var age = $('#age');

    var customerTable = $('#customerTable');

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
            var log = String.Format("{0} - {1} - {2} - {3}", "Customer Get Failed", xhr, status, error);
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
            "<td><button id='" + customer.id + "' class='btn btn-primary editButton'>Ändra</button></td>" +
            "<td><button id='" + customer.id + "' class='btn btn-primary removeButton'>Radera</button></td>";
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
            var log = String.Format("{0} - {1} - {2} - {3}", "Customer Create Failed", xhr, status, error);
            saveLog(log);
        });
    });

    function resetForm() {
        customerForm.find("input").val("");
        gender.val("Man");
    }

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
        button.text("Spara ändring").removeClass("create").addClass("edit").attr("id", id);
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

        $.ajax({
            url: "/api/customer",
            type: "PUT",
            data: customer
        }).done(function () {
            getCustomers();
            resetForm();
            button.text("Skapa kund").removeClass("edit").addClass("create");
            saveLog("CustomerId: " + id + " Edited");
        }).fail(function (xhr, status, error) {
            var log = String.Format("{0} - {1} - {2} - {3}", "Customer Edit Failed", xhr, status, error);
            saveLog(log);
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
            var log = String.Format("{0} - {1} - {2} - {3}", "Customer Delete Failed", xhr, status, error);
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
                var log = String.Format("{0} - {1} - {2} - {3}", "DB Seed Failed", xhr, status, error);
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
                var log = String.Format("{0} - {1} - {2} - {3}", "Log Retrieve Failed", xhr, status, error);
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
});