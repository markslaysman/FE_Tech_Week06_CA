class Department {
    constructor (name) {
        this.department = name;
        this.employees = [];
    }

    addEmployee(name, jobtitle) {
        this.employees.push(new Employee(name, jobtitle));
    }
}

class Employee {
    constructor(name, jobtitle) {
        this.name = name;
        this.jobtitle = jobtitle;
    }
}

class DepartmentService {
    static url = 'https://61ff088d5e1c4100174f6dd6.mockapi.io/api/departments';

    static getAllDepartments() {
        return $.get(this.url);
    }

    static getDepartment(id) {
        return $.get(this.url + `/${id}`);
    }

    static createDepartment(department) {

        return $.ajax({
            url: this.url,
            dataType: 'json',
            data: JSON.stringify(department),
            contentType: 'application/json',
            type: 'POST'
        });
    }

    static updateDepartment(department) {
        return $.ajax({
            url: this.url + `/${department.id}`,
            dataType: 'json',
            data: JSON.stringify(department),
            contentType: 'application/json',
            type: 'PUT'
        });
    }

    static deleteDepartment(id) {
        return $.ajax({
            url: this.url + `/${id}`,
            type: 'DELETE'
        });
    }
}

class DOMManager {
    static departments;

    static getAllDepartments() {
        DepartmentService.getAllDepartments().then(departments => this.render(departments));
    }

    static createDepartment(name){
        DepartmentService.createDepartment(new Department(name))
            .then(() => {
                return DepartmentService.getAllDepartments();
            })
            .then((departments) => this.render(departments));
    }

    static deleteDepartment(id) {
        DepartmentService.deleteDepartment(id)
            .then(() => {
                return DepartmentService.getAllDepartments();
            })
            .then((departments) => this.render(departments));
    }

    static addEmployee(id) {
        for (let department of this.departments) {
            if (department.id == id) {
                department.employees.push(new Employee($(`#${department.id}-employee-name`).val(), $(`#${department.id}-employee-jobtitle`).val()));
                DepartmentService.updateDepartment(department)
                    .then(() => {
                        return DepartmentService.getAllDepartments();
                    })
                    .then((departments) => this.render(departments));
            }
        }
    }
    
    static deleteEmployee(departmentId, employeeName) {
        for (let department of this.departments) {
            if (department.id == departmentId) {
                for (let employee of department.employees) {
                    if (employee.name == employeeName) {
                        department.employees.splice(department.employees.indexOf(employee), 1);
                        DepartmentService.updateDepartment(department)
                            .then(() => {
                                return DepartmentService.getAllDepartments();
                            })
                            .then((departments) => this.render(departments));
                    }
                }
            }
        }
    }

    static render(departments) {
        this.departments = departments;
        $('#app').empty();

        for (let department of departments) {
            $('#app').prepend(
                `<div id="${department.id}" class="card">
                    <div class="card-header">
                        <h2>${department.department}</h2>
                        <button class="btn btn-danger" onclick="DOMManager.deleteDepartment('${department.id}')">Delete</button>
                    </div>
                    <div class="card-body">
                        <div class="card">
                            <div class="row">
                                <div class="col-sm">
                                    <input type="text" id="${department.id}-employee-name" class="form-control" placeholder="Employee Name">
                                </div>
                                    
                                <div class="col-sm">
                                    <input type="text" id="${department.id}-employee-jobtitle" class="form-control" placeholder="Job Title">
                                </div>
                            </div>
                            <button id="${department.id}-new-employee" onclick="DOMManager.addEmployee('${department.id}')" class="btn btn-primary form-control">Add</button>
                        </div>
                    </div>
                </div><br>`
            );

            for (let employee of department.employees) {
                $(`#${department.id}`).find('.card-body').append(
                    `<p>
                        <span id="name-${employee.name}"><strong>Name: </strong> ${employee.name}</span>
                        <span id="jobtitle-${employee.jobtitle}"><strong>Job Title: </strong> ${employee.jobtitle}</span>
                        <button class="btn btn-danger" onclick="DOMManager.deleteEmployee('${department.id}', '${employee.name}')">Delete Employee</button>
                    `
                );
            }
        }
    }

}

$('#create-new-department').click(() => {
    DOMManager.createDepartment($('#new-department-name').val());
    $('#new-department-name').val('');
});

DOMManager.getAllDepartments();