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
          "Exit",
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
          "SELECT employee.id as employee_id, employee.first_name as first_name, employee.last_name as last_name, role.title as job_title, department.name as department_name, role.salary as salary, CONCAT(manager.first_name, ' ', manager.last_name) as manager_name FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id LEFT JOIN employee as manager ON employee.manager_id = manager.id;",
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
        let managerName = '';
        inquirer
          .prompt([
            {
              type: "input",
              name: "first_name",
              message: "What is the first name of the Employee?",
            },
            {
              type: "input",
              name: "last_name",
              message: "What is the last name of the Employee?",
            },
            {
              type: "list",
              name: "title",
              message: "What is the Employee's title?",
              choices: function () {
                return new Promise(function (resolve, reject) {
                  db.query("SELECT title FROM role", function (err, results) {
                    if (err) {
                      reject(err);
                    } else {
                      const roleTitles = results.map((row) => row.title);
                      resolve(roleTitles);
                    }
                  });
                });
              },
            },
            {
                type: "list",
                name: "manager",
                message: "Who is the Employee's manager?",
                choices: function () {
                    return new Promise(function (resolve, reject) {
                        db.query("SELECT CONCAT(first_name, ' ', last_name) AS manager_name, id FROM employee", function (err, results) {
                        if (err) {
                            reject(err);
                        } else {
                           const managerNames = results.map((row) => row.manager_name);
                            resolve(managerNames);
                        }
                        });
                    });
                    }
            }
          ])
          .then((answers) => {
            managerName = answers.manager;
            db.query(
              "SELECT id FROM role WHERE title = ?",
              [answers.title],
              function (err, results) {
                if (err) {
                  console.log(err);
                } else {
                  const role_id = results[0].id;
                  db.query('SELECT id FROM employee WHERE CONCAT(first_name, " ", last_name) = ?', [managerName], function(err, results) {
                    if (err) {
                        console.log(err);
                    } else {
                        const manager_id = results[0].id;
                  db.query(
                    `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`,
                    [answers.first_name, answers.last_name, role_id, manager_id],
                    function (err, results) {
                      if (err) {
                        console.log(err);
                      } else {
                        console.log(
                          `${answers.first_name} ${answers.last_name} has been added to employee's`
                        );
                        mainMenu();

                      } 
                    } 
                  ); 
                } 
              } 
            ); 

          }; 
        } 
        );
        });
          } else if (answers.action === "Update an Employee Role") {
        inquirer
          .prompt([
    {
      type: "list",
      name: "Employee Name",
      message: "What is the name of the employee you would like to update?",
      choices: function() {
        return new Promise(function(resolve, reject) {
          db.query("SELECT first_name, last_name FROM employee", function(err, results) {
            if (err) {
              reject(err);
            } else {
              const employeeNames = results.map(row => row.first_name + " " + row.last_name);
              resolve(employeeNames);
            }
          });
        });
      }
    },
    {
      type: "list",
      name: "title",
      message: "What is the Employee's new title?",
      choices: function() {
        return new Promise(function(resolve, reject) {
          db.query("SELECT title, id FROM role", function(err, results) {
            if (err) {
              reject(err);
            } else {
              const roleTitles = results.map(row => {
                return {
                  name: row.title,
                  value: row.id
                };
              });
              resolve(roleTitles);
            }
          });
        });
      }
    }
  ])
  .then((answers) => {
    db.query(
      `UPDATE employee SET role_id = ? WHERE first_name = ? AND last_name = ?`,
      [answers.title, answers["Employee Name"].split(" ")[0], answers["Employee Name"].split(" ")[1]],
      function(err, results) {
        if (err) {
          console.log("Error updating employee's title:", err);
        } else {
          console.log(`${answers["Employee Name"]} title has been updated`);
        }
        mainMenu();
      }
    );
  });
        
    } else if (answers.action === "Exit") {
        db.end();
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
