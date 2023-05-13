const inquirer = require("inquirer");
const mysql = require("mysql2");
const fs = require("fs");

const db = mysql.createConnection(
  {
    host: "localhost",

    user: "root",

    password: "",
    database: "company_db",
  },
  console.log("Connected to the company_db database.")
);

function mainMenu() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices: [
          "View all Departments",
          "View all Roles",
          "View all Employees",
          "Add a Department",
          "Add a Role",
          "Add an Employee",
          "Update an Employee Role",
        ],
      },
    ])

    .then((answers) => {
      if (answers.action === "View all Departments") {
        db.query(
          "SELECT id as deparment_id, name as department_name FROM department;",
          function (err, results) {
            console.table(results);
            mainMenu();
          }
        );
      } else if (answers.action === "View all Roles") {
        db.query(
          "SELECT role.title as job_title, role.id as role_id, department.name as department_name, role.salary FROM role JOIN department ON role.department_id = department.id;",
          function (err, results) {
            console.table(results);
            mainMenu();
          }
        );
      } else if (answers.action === "View all Employees") {
        db.query(
          "SELECT employee.id as employee_id, employee.first_name as first_name, employee.last_name as last_name, role.title as job_title, department.name as department_name, role.salary as salary, manager.first_name as manager_name FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id LEFT JOIN employee as manager ON employee.manager_id = manager.id;",
          function (err, results) {
            console.table(results);
            mainMenu();
          }
        );
      } else if (answers.action === "Add a Department") {
        inquirer
          .prompt([
            {
              type: "input",
              name: "name",
              message:
                "What is the name of the department you would like to add?",
            },
          ])
          .then((answers) => {
            db.query(
              `INSERT INTO department (name) VALUES (?)`,
              [answers.name],
              function (err, results) {
                console.log(`${answers.name} has been added to departments`);
                mainMenu();
              }
            );
          });
      } else if (answers.action === "Add a Role") {
        inquirer
          .prompt([
            {
              type: "input",
              name: "title",
              message: "What is the name of the role?",
            },
            {
              type: "input",
              name: "salary",
              message: "What is the salary?",
            },
            {
              type: "list",
              name: "department_name",
              message: "What department is this role for?",
              choices: function () {
                return new Promise(function (resolve, reject) {
                  db.query(
                    "SELECT name FROM department",
                    function (err, results) {
                      if (err) {
                        reject(err);
                      } else {
                        const departmentNames = results.map((row) => row.name);
                        resolve(departmentNames);
                      }
                    }
                  );
                });
              },
            },
          ])
          .then((answers) => {
            db.query(
              "SELECT id FROM department WHERE name = ?",
              [answers.department_name],
              function (err, results) {
                if (err) {
                  console.log(err);
                } else {
                  const department_id = results[0].id;
                  db.query(
                    `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`,
                    [answers.title, answers.salary, department_id],
                    function (err, results) {
                      if (err) {
                        console.log(err);
                      } else {
                        console.log(`${answers.title} has been added to roles`);
                        mainMenu();
                      }
                    }
                  );
                }
              }
            );
          });
      } else if (answers.action === "Add an Employee") {
        console.log("You chose to add an employee");
        ("INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (answers.first_name, answers.last_name, answers.role_id, answers.manager_id);");
      } else if (answers.action === "Update an Employee Role") {
        console.log("You chose to update an employee role");
        ("UPDATE employee SET role_id = answers.role_id WHERE id = answers.id;");
      }
    })
    .catch((error) => {
      if (error.isTtyError) {
        console.log("Prompt couldn't be rendered in the current environment");
      } else {
        console.log("Something else went wrong");
      }
    });
}

// Call the mainMenu when app starts
mainMenu();
