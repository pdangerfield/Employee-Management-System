INSERT INTO department (name)
    VALUES ('Sales'),
           ('Engineering'), 
           ('Finance'), 
           ('Legal'), 
           ('HR'), 
           ('Customer Service');

INSERT INTO role (title, salary, department_id)
    VALUES ('Sales Lead', 100000.00, 1),
        ('Salesperson', 80000.00, 1),
        ('Lead Engineer', 150000.00, 2),
        ('Software Engineer', 120000.00, 2),
        ('Accountant', 125000.00, 3),
        ('Legal Team Lead', 250000.00, 4),
        ('Lawyer', 190000.00, 4),
        ('HR Lead', 150000.00, 5),
        ('HR Representative', 100000.00, 5),
        ('Customer Service Lead', 100000.00, 6),
        ('Customer Service Representative', 80000.00, 6);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
    VALUES ('JOE', 'SMITH', 1, NULL),
        ('SALLY', 'JONES', 2, 1),
        ('BOB', 'JOHNSON', 3, NULL),
        ('JANE', 'DOE', 4, 3),
        ('MIKE', 'WILLIAMS', 5, NULL),
        ('SARAH', 'ANDERSON', 6, 5),
        ('JAMES', 'MILLER', 7, NULL),
        ('AMY', 'JONES', 8, 7),
        ('JENNIFER', 'SMITH', 9, NULL),
        ('TOM', 'WILSON', 10, 9);
